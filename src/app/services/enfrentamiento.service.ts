import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc } from '@angular/fire/firestore';
import { EnfrentamientoModel } from '../models/enfrentamiento.models';


@Injectable({
  providedIn: 'root',
})
export class EnfrentamientoService {
  private enfrentamientosCollection = 'enfrentamientos';

  constructor(private firestore: Firestore) {}

  async crearEnfrentamiento(enfrentamiento: EnfrentamientoModel): Promise<void> {
    const docRef = doc(collection(this.firestore, this.enfrentamientosCollection));
    enfrentamiento.id = docRef.id;
    enfrentamiento.fecha = new Date();
    await setDoc(docRef, enfrentamiento);
  }

  async actualizarPuntaje(id: string, participantes: EnfrentamientoModel['participantes']): Promise<void> {
    const docRef = doc(this.firestore, `${this.enfrentamientosCollection}/${id}`);
    await updateDoc(docRef, { participantes });
  }

  async finalizarEnfrentamiento(id: string, ganador: EnfrentamientoModel['ganador']): Promise<void> {
    const docRef = doc(this.firestore, `${this.enfrentamientosCollection}/${id}`);
    await updateDoc(docRef, { ganador });
  }

  async obtenerEnfrentamiento(id: string): Promise<EnfrentamientoModel | null> {
    const docRef = doc(this.firestore, `${this.enfrentamientosCollection}/${id}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as EnfrentamientoModel) : null;
  }
}
