import type {
  DocumentData,
  PartialWithFieldValue,
  WithFieldValue,
} from 'firebase-admin/firestore';

/** Shape of the `rate-limits/github` Firestore document. */
export type RateLimitDoc = {
  /** GitHub API calls remaining in the current window. */
  remaining: number;
  /** Unix timestamp (seconds) when the current window resets. */
  reset: number;
};

/** Use when writing a complete document (t.set / ref.set without merge). */
export type RateLimitWrite = WithFieldValue<RateLimitDoc>;

/** Use when partially updating an existing document (ref.update / t.update). */
export type RateLimitUpdate = PartialWithFieldValue<RateLimitDoc>;

/** Use when reading: cast doc.data() to this type. */
export type RateLimitData = RateLimitDoc & DocumentData;

/** Shape of a `users/{username}` Firestore document. */
export type UserDoc = {
  username: string;
};

/** Use when writing a complete document (ref.set). */
export type UserWrite = WithFieldValue<UserDoc>;

/** Use when reading: cast doc.data() to this type. */
export type UserData = UserDoc & DocumentData;
