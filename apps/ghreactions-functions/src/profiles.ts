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
   * Starts tracking users not stored yet, as ranked; never removes anyone, so
   * a user who drops out of the top list keeps their page. A user who only
   * had a snapshot someone asked for becomes ranked, and stops expiring.
   * Returns how many were added.
   *
   * Also gives the ranked flag to documents written before it existed, so
   * every document carries one. They are all ranked: unranked documents have
   * had the flag from the start. After the first run there are none left.
   */
  async addUsers(usernames: readonly string[]): Promise<number> {
    const snapshot = await collection().select('ranked').get();
    const stored = new Map(
      snapshot.docs.map((doc) => [doc.id, doc.get('ranked') as unknown]),
    );
    const create = usernames.filter((u) => !stored.has(docId(u)));
    const promote = usernames.filter((u) => stored.get(docId(u)) === false);
    const unflagged = [...stored]
      .filter(([, ranked]) => ranked === undefined)
      .map(([id]) => id);

    const writer = getFirestore().bulkWriter();
    for (const id of unflagged) {
      writer.update(collection().doc(id), { ranked: true });
    }
    for (const username of promote) {
      writer.update(collection().doc(docId(username)), {
        ranked: true,
        expireAt: FieldValue.delete(),
      });
    }
    for (const username of create) {
      writer.create(collection().doc(docId(username)), {
        username,
        ranked: true,
        status: 'pending',
        issues: [],
        pullRequests: [],
        issueComments: [],
        counts: { issues: 0, pullRequests: 0, issueComments: 0 },
        reactions: { issues: 0, pullRequests: 0, issueComments: 0 },
        totalReactions: 0,
        created: FieldValue.serverTimestamp(),
        lastUpdated: FieldValue.serverTimestamp(),
        lastFetched: null,
      } satisfies WriteProfile);
    }
    await writer.close();

    return create.length;
  },
};
