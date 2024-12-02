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
import { ParticipantModel, ScoreModel, SportType } from '../models/desafio';

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
    deporte: SportType,  // Deporte específico para el puntaje
    esGanador: boolean   // Valor que indica si el participante ganó
  ): Promise<void> {
    const scoreRef = doc(this.scoresCollection, participante.id);
    const scoreSnapshot = await getDoc(scoreRef);

    // Función para calcular el rango global
    const calculateRank = (score: number): string => {
      if (score >= 200) return 'Leyenda';
      if (score >= 100) return 'Experto';
      if (score >= 50) return 'Avanzado';
      if (score >= 20) return 'Intermedio';
      return 'Principiante';
    };

    // Función para calcular el rango por deporte
    const calculateSportRank = (score: number): string => {
      if (score >= 200) return 'Leyenda';
      if (score >= 100) return 'Experto';
      if (score >= 50) return 'Avanzado';
      if (score >= 20) return 'Intermedio';
      return 'Principiante';
    };

    if (scoreSnapshot.exists()) {
      // Si ya existe el puntaje para este participante
      const existingScore = scoreSnapshot.data() as ScoreModel;

      // Calculamos el puntaje por deporte
      const deportePuntaje = esGanador ? 10 : -5;

      // Actualizamos los puntajes por deporte
      const updatedDeportes = { ...existingScore.deportes };
      updatedDeportes[deporte] = {
        score: (updatedDeportes[deporte]?.score || 0) + deportePuntaje,
        rank: calculateSportRank((updatedDeportes[deporte]?.score || 0) + deportePuntaje), // Actualizamos el rank del deporte
      };

      // Calculamos el puntaje global (acumulado de todos los deportes)
      const totalScore = Object.values(updatedDeportes).reduce((acc, deporte) => acc + deporte.score, 0);

      // Recalculamos el rank global
      const updatedScore: ScoreModel = {
        id: participante.id,
        name: participante.name,
        score: totalScore,  // Puntaje global calculado
        victories: esGanador ? existingScore.victories + 1 : existingScore.victories,
        rank: calculateRank(totalScore),  // Rank global basado en el puntaje total
        deportes: updatedDeportes,  // Puntajes y ranks por deporte
      };

      await setDoc(scoreRef, updatedScore);
      console.log(`Puntaje actualizado para ${participante.name}:`, updatedScore);

    } else {
      // Si no existe el puntaje para este participante, lo creamos
      const deportePuntaje = esGanador ? 10 : -5;

      // Inicializamos el puntaje para el deporte
      const newDeportes = {
        [deporte]: {
          score: deportePuntaje,
          rank: calculateSportRank(deportePuntaje),
        }
      };

      // Calculamos el puntaje global (solo con el puntaje del deporte inicial)
      const totalScore = deportePuntaje;

      const newScore: ScoreModel = {
        id: participante.id,
        name: participante.name,
        score: totalScore,  // Puntaje global inicial
        victories: esGanador ? 1 : 0,
        rank: calculateRank(totalScore),  // Rank global inicial
        deportes: newDeportes,  // Puntajes y ranks por deporte
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
    const equipoRef = doc(
      this.firestore,
      this.equiposCollectionPath(eventId),
      equipo
    );
    const equipoSnapshot = await getDoc(equipoRef);

    if (equipoSnapshot.exists()) {
      const currentScore = equipoSnapshot.data()['score'] || 0;
      const updatedScore = currentScore + puntos;

      await setDoc(equipoRef, { score: updatedScore }, { merge: true });
      console.log(
        `Puntaje actualizado para el equipo ${equipo}: ${updatedScore}`
      );
    } else {
      await setDoc(equipoRef, { score: puntos });
      console.log(`Puntaje inicializado para el equipo ${equipo}: ${puntos}`);
    }
  }

  // **Método NUEVO: Incrementar puntaje de participante**
  async incrementarPuntajeParticipanteEnEvento(
    participanteId: string,
    eventId: string,
    puntos: number = 1
  ): Promise<void> {
    const participantesCollection = collection(
      this.firestore,
      `eventos/${eventId}/participantes`
    );
    const participanteRef = doc(participantesCollection, participanteId);
    const participanteSnapshot = await getDoc(participanteRef);

    if (participanteSnapshot.exists()) {
      const currentScore = participanteSnapshot.data()!['score'] || 0;
      const updatedScore = currentScore + puntos;

      // Actualiza solo el puntaje del participante en la colección de "participantes"
      await setDoc(participanteRef, { score: updatedScore }, { merge: true });
      console.log(
        `Puntaje incrementado para ${participanteId}: ${updatedScore}`
      );
    } else {
      console.warn(`El participante con ID ${participanteId} no existe.`);
    }
  }
  // **Método NUEVO: Inicializar equipos al crear el enfrentamiento**
  async inicializarEquipos(eventId: string, equipos: string[]): Promise<void> {
    const equiposCollection = collection(
      this.firestore,
      this.equiposCollectionPath(eventId)
    );
    for (const equipo of equipos) {
      const equipoRef = doc(equiposCollection, equipo);
      const equipoSnapshot = await getDoc(equipoRef);

      if (!equipoSnapshot.exists()) {
        await setDoc(equipoRef, { score: 0 });
        console.log(`Equipo inicializado: ${equipo}`);
      }
    }
  }
  async getParticipanteByEventAndUser(
    eventId: string,
    userId: string
  ): Promise<ParticipantModel | null> {
    const participanteRef = doc(
      this.firestore,
      `eventos/${eventId}/participantes/${userId}`
    );
    const participanteSnapshot = await getDoc(participanteRef);

    if (participanteSnapshot.exists()) {
      console.log('Participante encontrado:', participanteSnapshot.data());
      return participanteSnapshot.data() as ParticipantModel;
    } else {
      console.warn(
        `No se encontró al participante con ID ${userId} en el evento ${eventId}.`
      );
      return null;
    }
  }
  // **Método NUEVO: Recuperar el puntaje del participante dentro del evento**
  async getParticipantePuntajeEnEvento(
    participanteId: string,
    eventId: string
  ): Promise<number> {
    const participanteRef = doc(
      this.firestore,
      `eventos/${eventId}/participantes/${participanteId}`
    );
    const participanteSnapshot = await getDoc(participanteRef);

    if (participanteSnapshot.exists()) {
      // Si el participante existe, retorna el puntaje actual.
      return participanteSnapshot.data()!['score'] || 0;
    } else {
      // Si no existe, retornar puntaje inicial 0.
      console.warn(
        `El participante con ID ${participanteId} no tiene puntaje almacenado.`
      );
      return 0;
    }
  }
  // **Método NUEVO: Obtener puntajes de los equipos**
  async getPuntajesEquipos(
    eventId: string
  ): Promise<{ [key: string]: number }> {
    const equiposCollection = collection(
      this.firestore,
      this.equiposCollectionPath(eventId)
    );
    const equiposSnapshot = await getDocs(equiposCollection);

    const puntajes: { [key: string]: number } = {};
    equiposSnapshot.forEach((doc) => {
      puntajes[doc.id] = doc.data()['score'] || 0;
    });

    return puntajes;
  }
}
