import { TestBed } from '@angular/core/testing';
import { WINDOW } from '@org/window';
import { DraftStore } from './draft-store';

/** A Map-backed Storage, so tests don't share the real localStorage. */
function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    key: (i) => [...items.keys()][i] ?? null,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
  };
}

function setup(window: unknown) {
  TestBed.configureTestingModule({
    providers: [{ provide: WINDOW, useValue: window }],
  });
  return TestBed.inject(DraftStore);
}

describe('DraftStore', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    vi.useFakeTimers({ now: new Date('2026-11-12T10:00:00.000Z') });
  });

  afterEach(() => vi.useRealTimers());

  it('returns what was saved, with when it was saved', () => {
    const drafts = setup({ localStorage: storage });

    drafts.set('1-1', 'int main;');

    expect(drafts.get('1-1')).toEqual({
      code: 'int main;',
      savedAt: '2026-11-12T10:00:00.000Z',
    });
    expect(drafts.get('1-2')).toBeNull();
  });

  it('deletes one draft', () => {
    const drafts = setup({ localStorage: storage });
    drafts.set('1-1', 'a');
    drafts.set('1-2', 'b');

    drafts.delete('1-1');

    expect(drafts.get('1-1')).toBeNull();
    expect(drafts.get('1-2')?.code).toBe('b');
  });

  it('clears every draft but leaves other keys alone', () => {
    const drafts = setup({ localStorage: storage });
    storage.setItem('theme', 'dark');
    drafts.set('1-1', 'a');
    drafts.set('1-2', 'b');

    drafts.clear();

    expect(drafts.get('1-1')).toBeNull();
    expect(drafts.get('1-2')).toBeNull();
    expect(storage.getItem('theme')).toBe('dark');
  });

  it('ignores a malformed entry', () => {
    const drafts = setup({ localStorage: storage });
    storage.setItem('tcpl:draft:1-1', '{not json');
    storage.setItem('tcpl:draft:1-2', JSON.stringify({ code: 1 }));

    expect(drafts.get('1-1')).toBeNull();
    expect(drafts.get('1-2')).toBeNull();
  });

  it('does nothing on the server', () => {
    const drafts = setup(null);

    drafts.set('1-1', 'a');
    drafts.clear();

    expect(drafts.get('1-1')).toBeNull();
  });

  it('carries on when storage throws', () => {
    const fail = () => {
      throw new Error('blocked');
    };
    const drafts = setup({
      localStorage: { ...storage, getItem: fail, setItem: fail },
    });

    expect(() => drafts.set('1-1', 'a')).not.toThrow();
    expect(drafts.get('1-1')).toBeNull();
  });

  it('carries on when even reading localStorage throws', () => {
    const drafts = setup({
      get localStorage(): Storage {
        throw new Error('blocked');
      },
    });

    expect(() => drafts.set('1-1', 'a')).not.toThrow();
    expect(drafts.get('1-1')).toBeNull();
  });
});
