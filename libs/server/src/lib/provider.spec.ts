import { createProvider } from './provider';

describe('createProvider', () => {
  it('creates the value lazily, once', () => {
    const create = vi.fn(() => ({ id: Math.random() }));
    const provider = createProvider(create);

    expect(create).not.toHaveBeenCalled();
    expect(provider.get()).toBe(provider.get());
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('uses a provided value instead of creating one', () => {
    const create = vi.fn(() => 'real');
    const provider = createProvider(create);

    provider.provide('fake');

    expect(provider.get()).toBe('fake');
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a fresh value after reset', () => {
    const provider = createProvider(() => ({}));
    const first = provider.get();

    provider.reset();

    expect(provider.get()).not.toBe(first);
  });
});
