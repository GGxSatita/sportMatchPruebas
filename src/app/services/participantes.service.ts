import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocs,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { ParticipantModel, ScoreModel } from '../models/desafio';

@Injectable({
  providedIn: 'root',
})
export class ParticipantesService {
  private scoresCollection = collection(this.firestore, 'scores');
  private equiposCollectionPath = (eventId: string) =>
    `eventos/${eventId}/equipos`;

  constructor(private firestore: Firestore) {}

  // **Método existente: Registrar participantes en enfrentamientos normales**
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
    console.log(
      `Participante registrado: ${participante.name}, Evento: ${eventId}`
    );
  }

  // **Método existente: Obtener participantes en tiempo real**
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

  // **NUEVO: Registrar participante con equipo**
  async addParticipanteConEquipo(
    participante: ParticipantModel,
    eventId: string,
    equipo: string
  ): Promise<void> {
    const participantesCollection = collection(
      this.firestore,
      `eventos/${eventId}/participantes`
    );
    const participanteRef = doc(participantesCollection, participante.id);

    const participanteData = {
      ...participante,
      equipo, // Añadir el equipo al participante
    };

    const participanteSnapshot = await getDoc(participanteRef);
    if (!participanteSnapshot.exists()) {
      await setDoc(participanteRef, participanteData);
      console.log(
        `Participante registrado: ${participante.name}, Equipo: ${equipo}, Evento: ${eventId}`
      );
    } else {
      console.warn(
        `El participante ${participante.name} ya está registrado en el evento ${eventId}`
      );
    }
  }

  // **Método existente: Guardar puntaje de enfrentamientos normales**
  async guardarPuntaje(
    participante: ParticipantModel,
    esGanador: boolean
  ): Promise<void> {
    const scoreRef = doc(this.scoresCollection, participante.id);
    const scoreSnapshot = await getDoc(scoreRef);

    const calculateRank = (score: number): string => {
      if (score >= 100) return 'Experto';
      if (score >= 50) return 'Avanzado';
      if (score >= 20) return 'Intermedio';
      return 'Principiante';
    };

    if (scoreSnapshot.exists()) {
      const existingScore = scoreSnapshot.data() as ScoreModel;

      const updatedScore: ScoreModel & { rank: string } = {
        id: participante.id,
        name: participante.name,
        score: existingScore.score + (esGanador ? 10 : -5),
        victories: esGanador
          ? existingScore.victories + 1
          : existingScore.victories,
        rank: calculateRank(
          existingScore.score + (esGanador ? 10 : -5) // Calcular el rango actualizado
        ),
      };

      updatedScore.score = Math.max(0, updatedScore.score);

      await setDoc(scoreRef, updatedScore);
      console.log(
        `Puntaje actualizado para ${participante.name}:`,
        updatedScore
      );
    } else {
      const newScore: ScoreModel & { rank: string } = {
        id: participante.id,
        name: participante.name,
        score: esGanador ? 10 : 0,
        victories: esGanador ? 1 : 0,
        rank: calculateRank(esGanador ? 10 : 0), // Calcular el rango inicial
      };

      await setDoc(scoreRef, newScore);
      console.log(`Nuevo puntaje creado para ${participante.name}:`, newScore);
    }
  }


  // **Método NUEVO: Incrementar puntaje del equipo**
  async incrementarPuntajeEquipo(
    eventId: string,
    equipo: string,
    puntos: number = 1
  ): Promise<void> {
    const equipoRef = doc(this.firestore, this.equiposCollectionPath(eventId), equipo);
    const equipoSnapshot = await getDoc(equipoRef);

    if (equipoSnapshot.exists()) {
      const currentScore = equipoSnapshot.data()['score'] || 0;
      const updatedScore = currentScore + puntos;

      await setDoc(equipoRef, { score: updatedScore }, { merge: true });
      console.log(`Puntaje actualizado para el equipo ${equipo}: ${updatedScore}`);
    } else {
      await setDoc(equipoRef, { score: puntos });
      console.log(`Puntaje inicializado para el equipo ${equipo}: ${puntos}`);
    }
  }

  // **Método NUEVO: Inicializar equipos al crear el enfrentamiento**
  async inicializarEquipos(eventId: string, equipos: string[]): Promise<void> {
    const equiposCollection = collection(this.firestore, this.equiposCollectionPath(eventId));
    for (const equipo of equipos) {
      const equipoRef = doc(equiposCollection, equipo);
      const equipoSnapshot = await getDoc(equipoRef);

      if (!equipoSnapshot.exists()) {
        await setDoc(equipoRef, { score: 0 });
        console.log(`Equipo inicializado: ${equipo}`);
      }
    }
  }

  // **Método NUEVO: Obtener puntajes de los equipos**
  async getPuntajesEquipos(eventId: string): Promise<{ [key: string]: number }> {
    const equiposCollection = collection(this.firestore, this.equiposCollectionPath(eventId));
    const equiposSnapshot = await getDocs(equiposCollection);

    const puntajes: { [key: string]: number } = {};
    equiposSnapshot.forEach((doc) => {
      puntajes[doc.id] = doc.data()['score'] || 0;
    });

    return puntajes;
  }
}
