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
  async marcarInterrumpidoSiJugadorSeVa(id: string, participantes: EnfrentamientoModel['participantes']): Promise<void> {
    const docRef = doc(this.firestore, `${this.enfrentamientosCollection}/${id}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const enfrentamientoData = docSnap.data() as EnfrentamientoModel;

      // Verificar si algún participante se ha ido
      const jugadorAbandonado = participantes.some(participante => participante.estaActivo === false);

      if (jugadorAbandonado && !enfrentamientoData.ganador) {
        // Si un jugador se ha ido y el enfrentamiento no tiene ganador, marcar como interrumpido
        await updateDoc(docRef, { interrumpido: true });
        console.log(`El enfrentamiento ${id} ha sido marcado como interrumpido debido a que un jugador abandonó.`);
      }
    }
  }
}
