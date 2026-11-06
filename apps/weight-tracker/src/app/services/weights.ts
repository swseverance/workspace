import { inject, Injectable } from '@angular/core';
import { AUTH, FIRESTORE } from '@org/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { WeightEntry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class Weights {
  // Only ever called client-side, behind the authGuard, so these are never null.
  private firestore = inject(FIRESTORE)!;
  private auth = inject(AUTH)!;

  private collection() {
    return collection(
      this.firestore,
      'users',
      this.auth.currentUser!.uid,
      'weights',
    );
  }

  async getEntries(): Promise<WeightEntry[]> {
    const snapshot = await getDocs(
      query(this.collection(), orderBy('date', 'desc')),
    );

    return snapshot.docs.map((d) => d.data() as WeightEntry);
  }

  async upsertEntry(date: string, weight: number): Promise<WeightEntry> {
    const entry: WeightEntry = { id: date, date, weight };

    await setDoc(doc(this.collection(), date), entry);

    return entry;
  }

  async deleteEntry(date: string): Promise<void> {
    await deleteDoc(doc(this.collection(), date));
  }
}
