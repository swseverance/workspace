import { inject, Service } from '@angular/core';
import { WINDOW } from '@org/window';

const KEY_PREFIX = 'tcpl:draft:';

/** Code the user typed but hasn't submitted, and when they typed it. */
export type Draft = { code: string; savedAt: string };

/**
 * Unsubmitted code, kept in this browser's localStorage so it survives a
 * reload or a closed tab. Submissions are what the server keeps.
 *
 * Storage can be missing (on the server) or throw (private mode, full
 * quota, blocked site data), so every call is safe to make anywhere: reads
 * then find nothing and writes are dropped.
 */
@Service()
export class DraftStore {
  private readonly storage = storageOf(inject(WINDOW));

  get(exerciseId: string): Draft | null {
    try {
      const value = this.storage?.getItem(KEY_PREFIX + exerciseId);
      if (!value) {
        return null;
      }
      const draft = JSON.parse(value) as Partial<Draft>;
      return typeof draft.code === 'string' && typeof draft.savedAt === 'string'
        ? { code: draft.code, savedAt: draft.savedAt }
        : null;
    } catch {
      return null;
    }
  }

  set(exerciseId: string, code: string): void {
    const draft: Draft = { code, savedAt: new Date().toISOString() };
    try {
      this.storage?.setItem(KEY_PREFIX + exerciseId, JSON.stringify(draft));
    } catch {
      // Not saved; the editor still has the code.
    }
  }

  delete(exerciseId: string): void {
    try {
      this.storage?.removeItem(KEY_PREFIX + exerciseId);
    } catch {
      // Nothing to do.
    }
  }

  /** Deletes every draft, e.g. when someone signs out of a shared computer. */
  clear(): void {
    try {
      const storage = this.storage;
      if (!storage) {
        return;
      }
      const keys = Array.from({ length: storage.length }, (_, i) =>
        storage.key(i),
      ).filter((key): key is string => key?.startsWith(KEY_PREFIX) ?? false);
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Nothing to do.
    }
  }
}

/** Even reading window.localStorage throws when site data is blocked. */
function storageOf(window: Window | null): Storage | null {
  try {
    return window?.localStorage ?? null;
  } catch {
    return null;
  }
}
