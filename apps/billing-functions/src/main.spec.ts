import { beforeEach, expect, test, vi } from 'vitest';

vi.mock('firebase-functions', () => ({ setGlobalOptions: vi.fn() }));
vi.mock('firebase-functions/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));
vi.mock('firebase-functions/v2/pubsub', () => ({
  onMessagePublished: vi.fn((_topic: string, handler: Function) => handler),
}));

const mockClient = vi.hoisted(() => ({
  listProjectBillingInfo: vi.fn(),
  updateProjectBillingInfo: vi.fn(),
}));
vi.mock('@google-cloud/billing', () => ({
  CloudBillingClient: class {
    listProjectBillingInfo = mockClient.listProjectBillingInfo;
    updateProjectBillingInfo = mockClient.updateProjectBillingInfo;
  },
}));

const { billingKillSwitch } = await import('./main');

function makeEvent(data: object) {
  return {
    data: {
      message: { data: Buffer.from(JSON.stringify(data)).toString('base64') },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

test('within budget: billing API is never called', async () => {
  await billingKillSwitch(
    makeEvent({ costAmount: 50, budgetAmount: 100 }) as any,
  );
  expect(mockClient.listProjectBillingInfo).not.toHaveBeenCalled();
});

test('at budget: billing API is never called', async () => {
  await billingKillSwitch(
    makeEvent({ costAmount: 100, budgetAmount: 100 }) as any,
  );
  expect(mockClient.listProjectBillingInfo).not.toHaveBeenCalled();
});

test('over budget: billing API is called', async () => {
  const projects = [
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);
  mockClient.updateProjectBillingInfo.mockResolvedValue(undefined);

  await billingKillSwitch(
    makeEvent({ costAmount: 101, budgetAmount: 100 }) as any,
  );
  expect(mockClient.updateProjectBillingInfo).toHaveBeenCalledWith({
    name: 'projects/proj-a',
    projectBillingInfo: { billingAccountName: '' },
  });
});

test('dry run: lists projects but does not unlink', async () => {
  const projects = [
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
    { name: 'projects/proj-b', projectId: 'proj-b', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);

  await billingKillSwitch(
    makeEvent({ costAmount: 101, budgetAmount: 100, dryRun: true }) as any,
  );
  expect(mockClient.listProjectBillingInfo).toHaveBeenCalledTimes(1);
  expect(mockClient.updateProjectBillingInfo).not.toHaveBeenCalled();
});

test('kill: only unlinks billing-enabled projects', async () => {
  const projects = [
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
    { name: 'projects/proj-b', projectId: 'proj-b', billingEnabled: false },
    { name: 'projects/proj-c', projectId: 'proj-c', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);
  mockClient.updateProjectBillingInfo.mockResolvedValue(undefined);

  await billingKillSwitch(
    makeEvent({ costAmount: 101, budgetAmount: 100 }) as any,
  );
  expect(mockClient.updateProjectBillingInfo).toHaveBeenCalledTimes(2);
  expect(mockClient.updateProjectBillingInfo).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'projects/proj-a' }),
  );
  expect(mockClient.updateProjectBillingInfo).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'projects/proj-c' }),
  );
});

const SELF = {
  name: 'projects/fir-billing-dd1db',
  projectId: 'fir-billing-dd1db',
  billingEnabled: true,
};

test('kill: unlinks the project hosting the kill switch last', async () => {
  const projects = [
    SELF,
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
    { name: 'projects/proj-b', projectId: 'proj-b', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);
  mockClient.updateProjectBillingInfo.mockResolvedValue(undefined);

  await billingKillSwitch(
    makeEvent({ costAmount: 101, budgetAmount: 100 }) as any,
  );
  expect(
    mockClient.updateProjectBillingInfo.mock.calls.map(([req]) => req.name),
  ).toEqual([
    'projects/proj-a',
    'projects/proj-b',
    'projects/fir-billing-dd1db',
  ]);
});

test('kill: keeps the hosting project linked if another project fails', async () => {
  const projects = [
    SELF,
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);
  mockClient.updateProjectBillingInfo.mockRejectedValue(
    new Error('permission denied'),
  );

  await billingKillSwitch(
    makeEvent({ costAmount: 101, budgetAmount: 100 }) as any,
  );
  expect(
    mockClient.updateProjectBillingInfo.mock.calls.map(([req]) => req.name),
  ).toEqual(['projects/proj-a']);
});

test('kill: continues if one project fails to unlink', async () => {
  const projects = [
    { name: 'projects/proj-a', projectId: 'proj-a', billingEnabled: true },
    { name: 'projects/proj-b', projectId: 'proj-b', billingEnabled: true },
  ];
  mockClient.listProjectBillingInfo.mockResolvedValue([projects]);
  mockClient.updateProjectBillingInfo
    .mockRejectedValueOnce(new Error('permission denied'))
    .mockResolvedValueOnce(undefined);

  await expect(
    billingKillSwitch(makeEvent({ costAmount: 101, budgetAmount: 100 }) as any),
  ).resolves.toBeUndefined();
  expect(mockClient.updateProjectBillingInfo).toHaveBeenCalledTimes(2);
});
