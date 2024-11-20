import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { ReglasModel } from '../models/reglas-evento';

@Injectable({
  providedIn: 'root',
})
export class ReglasService {
  private reglasCollection = collection(this.firestore, 'reglas');
  private collectionName = 'reglas';

  constructor(private firestore: Firestore) {}

  async createReglas(reglas: ReglasModel): Promise<void> {
    const reglasRef = collection(this.firestore, this.collectionName);
    await addDoc(reglasRef, { ...reglas });
  }

  async getReglasByEventId(eventId: string): Promise<ReglasModel | null> {
    const reglasQuery = query(this.reglasCollection, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(reglasQuery);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ReglasModel;
    }
    return null;
  }

  async updateReglas(id: string, reglas: Partial<ReglasModel>): Promise<void> {
    const reglaDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(reglaDoc, { ...reglas });
  }

  async deleteReglas(id: string): Promise<void> {
    const reglaDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(reglaDoc);
  }
}
