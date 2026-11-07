import type { DocumentData, WithFieldValue } from 'firebase-admin/firestore';

/** Shape of a `users/{username}` Firestore document. */
export type UserDoc = {
  username: string;
};

/** Use when writing a complete document (ref.set). */
export type UserWrite = WithFieldValue<UserDoc>;

/** Use when reading: cast doc.data() to this type. */
export type UserData = UserDoc & DocumentData;
