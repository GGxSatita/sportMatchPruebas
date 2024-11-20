import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { ParticipantModel } from '../models/desafio';

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  private participantesCollection = collection(this.firestore, 'participantes');

  constructor(private firestore: Firestore) {}

  async addParticipante(participante: ParticipantModel): Promise<void> {
    const participanteRef = doc(this.participantesCollection, participante.id);
    await setDoc(participanteRef, participante);
  }

  getParticipantesTiempoReal(callback: (participantes: ParticipantModel[]) => void): void {
    onSnapshot(this.participantesCollection, (snapshot) => {
      const participantes = snapshot.docs.map((doc) => doc.data() as ParticipantModel);
      callback(participantes);
    });
  }

  async getUserNameById(userId: string): Promise<string> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data() as { name: string };
        console.log(`Nombre obtenido para ${userId}:`, data.name); // Verifica el nombre
        return data.name || 'Usuario Anónimo';
      } else {
        console.warn(`Usuario con ID ${userId} no encontrado.`);
        return 'Usuario Anónimo';
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return 'Usuario Anónimo';
    }
  }
}
