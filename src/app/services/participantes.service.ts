import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  getDocs,
  deleteDoc,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { ParticipantModel, ScoreModel } from '../models/desafio';

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  private eventosCollection = collection(this.firestore, 'eventos'); // Colección de eventos
  private scoresCollection = collection(this.firestore, 'scores');

  constructor(private firestore: Firestore) {}

  // Agregar un participante a un evento específico
  async addParticipante(
    participante: ParticipantModel,
    eventId: string
  ): Promise<void> {
    const participantesCollection = collection(
      this.firestore,
      `eventos/${eventId}/participantes`
    );
    const participanteRef = doc(participantesCollection, participante.id);
    await setDoc(participanteRef, participante);
  }

  // Obtener participantes de un evento en tiempo real
  getParticipantesTiempoReal(
    eventId: string,
    callback: (participantes: ParticipantModel[]) => void
  ): void {
    const participantesCollection = collection(
      this.firestore,
      `eventos/${eventId}/participantes`
    );
    onSnapshot(participantesCollection, (snapshot) => {
      const participantes = snapshot.docs.map(
        (doc) => doc.data() as ParticipantModel
      );
      callback(participantes);
    });
  }

  // Obtener el nombre de un usuario por su ID
  async getUserNameById(userId: string): Promise<string> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data() as { name: string };
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
  async guardarPuntaje(
    participante: ParticipantModel,
    esGanador: boolean
  ): Promise<void> {
    const scoreRef = doc(this.scoresCollection, participante.id);
    const scoreSnapshot = await getDoc(scoreRef);

    if (scoreSnapshot.exists()) {
      // Si el documento ya existe, actualizar los valores
      const existingScore = scoreSnapshot.data() as ScoreModel;

      const updatedScore: ScoreModel = {
        id: participante.id,
        name: participante.name,
        score: existingScore.score + (esGanador ? 10 : -5), // Ganador +10, Perdedor -5
        victories: esGanador
          ? existingScore.victories + 1
          : existingScore.victories,
      };

      // Asegurar que el puntaje no sea negativo
      updatedScore.score = Math.max(0, updatedScore.score);

      await setDoc(scoreRef, updatedScore); // Guardar en Firestore
      console.log(
        `Puntaje actualizado para ${participante.name}:`,
        updatedScore
      );
    } else {
      // Si el documento no existe, crearlo
      const newScore: ScoreModel = {
        id: participante.id,
        name: participante.name,
        score: esGanador ? 10 : 0, // Puntos iniciales
        victories: esGanador ? 1 : 0, // Primera victoria solo si ganó
      };

      await setDoc(scoreRef, newScore); // Guardar en Firestore
      console.log(`Nuevo puntaje creado para ${participante.name}:`, newScore);
    }
  }
}
