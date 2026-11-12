import {
  ProfileFields,
  UpdateProfile,
  WriteProfile,
} from '@org/ghreactions-github';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const collection = () => getFirestore().collection('profiles');
const docId = (username: string) => username.toLowerCase();

// An object, so specs can replace it.
export const profileStore = {
  /** The username of the profile updated longest ago, if there are any. */
  async findStalest(): Promise<string | undefined> {
    const snapshot = await collection()
      .orderBy('lastUpdated')
      .select('username')
      .limit(1)
      .get();
    return snapshot.docs[0]?.get('username') as string | undefined;
  },

  /** Sends a profile to the back of the queue without changing it. */
  async touch(username: string): Promise<void> {
    await collection()
      .doc(docId(username))
      .update({
        lastUpdated: FieldValue.serverTimestamp(),
      } satisfies UpdateProfile);
  },

  /** Stores the result of a refresh. */
  async write({ username, ...fields }: ProfileFields): Promise<void> {
    await collection()
      .doc(docId(username))
      .update({
        ...fields,
        lastFetched: FieldValue.serverTimestamp(),
        lastUpdated: FieldValue.serverTimestamp(),
      } satisfies UpdateProfile);
  },

  /**
   * Starts tracking users not stored yet; never removes anyone, so a user who
   * drops out of the top list keeps their page. Returns how many were added.
   */
  async addUsers(usernames: readonly string[]): Promise<number> {
    // select() with no fields fetches only the document ids.
    const snapshot = await collection().select().get();
    const stored = new Set(snapshot.docs.map((doc) => doc.id));
    const create = usernames.filter((u) => !stored.has(docId(u)));

    const writer = getFirestore().bulkWriter();
    for (const username of create) {
      writer.create(collection().doc(docId(username)), {
        username,
        status: 'pending',
        issues: [],
        pullRequests: [],
        issueComments: [],
        counts: { issues: 0, pullRequests: 0, issueComments: 0 },
        created: FieldValue.serverTimestamp(),
        lastUpdated: FieldValue.serverTimestamp(),
        lastFetched: null,
      } satisfies WriteProfile);
    }
    await writer.close();

    return create.length;
  },
};
