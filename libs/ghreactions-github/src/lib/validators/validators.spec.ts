import { describe, expect, it } from 'vitest';
import { IssueState } from '../../models/github';
import { cursorField, makeStateField, usernameField } from './validators';

describe('usernameField', () => {
  it('accepts a valid username', () => {
    expect(usernameField.parse('octocat')).toBe('octocat');
  });

  it('trims whitespace', () => {
    expect(usernameField.parse('  octocat  ')).toBe('octocat');
  });

  it('rejects an empty string', () => {
    expect(() => usernameField.parse('')).toThrow('username is required');
  });

  it('rejects a whitespace-only string', () => {
    expect(() => usernameField.parse('   ')).toThrow('username is required');
  });

  it('rejects undefined (missing query param)', () => {
    expect(() => usernameField.parse(undefined)).toThrow(
      'username is required',
    );
  });

  it('rejects an array (repeated query param)', () => {
    expect(() => usernameField.parse(['octocat', 'hubot'])).toThrow(
      'username is required',
    );
  });
});

describe('cursorField', () => {
  it('accepts a cursor string', () => {
    expect(cursorField.parse('abc123')).toBe('abc123');
  });

  it('defaults to null when undefined (missing query param)', () => {
    expect(cursorField.parse(undefined)).toBeNull();
  });

  it('accepts null', () => {
    expect(cursorField.parse(null)).toBeNull();
  });

  it('rejects an array (repeated query param)', () => {
    expect(() => cursorField.parse(['abc', 'def'])).toThrow();
  });
});

describe('makeStateField', () => {
  const stateField = makeStateField([IssueState.Open, IssueState.Closed]);

  it('wraps a single valid value in an array', () => {
    expect(stateField.parse('OPEN')).toEqual(['OPEN']);
  });

  it('accepts an array of valid values', () => {
    expect(stateField.parse(['OPEN', 'CLOSED'])).toEqual(['OPEN', 'CLOSED']);
  });

  it('rejects an invalid value', () => {
    expect(() => stateField.parse('MERGED')).toThrow();
  });

  it('rejects an array containing an invalid value', () => {
    expect(() => stateField.parse(['OPEN', 'MERGED'])).toThrow();
  });

  it('rejects undefined (missing query param)', () => {
    expect(() => stateField.parse(undefined)).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => stateField.parse('')).toThrow();
  });
});
