import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileStore } from './profiles';

// A stand-in Firestore: `stored` maps document ids to their ranked flag
// (undefined for a document written before the flag existed).
const firestore = vi.hoisted(() => ({
  stored: {} as Record<string, boolean | undefined>,
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => 'now',
    delete: () => 'delete',
  },
  getFirestore: () => ({
    collection: () => ({
      doc: (id: string) => id,
      select: () => ({
        get: async () => ({
          docs: Object.entries(firestore.stored).map(([id, ranked]) => ({
            id,
            get: () => ranked,
          })),
        }),
      }),
    }),
    bulkWriter: () => ({
      create: firestore.create,
      update: firestore.update,
      close: async () => undefined,
    }),
  }),
}));

describe('profileStore.addUsers', () => {
  beforeEach(() => {
    firestore.create.mockClear();
    firestore.update.mockClear();
  });

  it('adds new users as ranked and leaves stored ranked users alone', async () => {
    firestore.stored = { known: true };

    expect(await profileStore.addUsers(['Known', 'NewUser'])).toBe(1);

    expect(firestore.create).toHaveBeenCalledTimes(1);
    expect(firestore.create).toHaveBeenCalledWith(
      'newuser',
      expect.objectContaining({
        username: 'NewUser',
        ranked: true,
        status: 'pending',
      }),
    );
    expect(firestore.update).not.toHaveBeenCalled();
  });

  it('makes a top user with a requested snapshot ranked, and stops it expiring', async () => {
    firestore.stored = { requested: false, 'someone-else': false };

    expect(await profileStore.addUsers(['Requested'])).toBe(0);

    expect(firestore.update).toHaveBeenCalledTimes(1);
    expect(firestore.update).toHaveBeenCalledWith('requested', {
      ranked: true,
      expireAt: 'delete',
    });
  });

  it('flags every document written before the flag existed as ranked', async () => {
    // Including one that has since dropped out of the top list.
    firestore.stored = { 'in-list': undefined, 'dropped-out': undefined };

    await profileStore.addUsers(['in-list']);

    expect(firestore.update).toHaveBeenCalledWith('in-list', { ranked: true });
    expect(firestore.update).toHaveBeenCalledWith('dropped-out', {
      ranked: true,
    });
    expect(firestore.create).not.toHaveBeenCalled();
  });
});
