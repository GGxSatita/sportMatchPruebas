import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { ReglasModel } from '../models/reglas-evento';

@Injectable({
  providedIn: 'root',
})
export class ReglasService {
  private collectionName = 'reglas';

  constructor(private firestore: Firestore) {}

  async createReglas(reglas: ReglasModel): Promise<void> {
    const reglasRef = collection(this.firestore, this.collectionName);
    await addDoc(reglasRef, { ...reglas });
  }

  async getReglaById(id: string): Promise<ReglasModel | undefined> {
    const reglaDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    const docSnapshot = await getDoc(reglaDoc);
    return docSnapshot.exists()
      ? (docSnapshot.data() as ReglasModel)
      : undefined;
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
