export type SportType = 'FUTBOL' | 'TENIS' | 'BASQUETBOL' | 'VOLEIBOL' | 'OTRO';
export type ChallengeStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';
export type ChallengeType =
  | 'PUNTOS'
  | 'GOLES'
  | 'SETS'
  | 'PARTIDO'
  | 'OBJETIVO';

export interface ParticipantModel {
  id: string; // ID del alumno (UID de Firebase)
  name: string; // Nombre del jugador o equipo
  score: number; // Puntos acumulados o goles anotados
  setsWon?: number; // Sets ganados (para deportes de sets)
}

export interface ReglasModel {
  id: string; // ID único de las reglas
  creatorId: string; // ID del usuario que creó las reglas
  eventId: string; // ID del evento asociado
  pointsToWin?: number; // Puntos necesarios para ganar
  reglasAdicionales?: string; // Si se permite tiempo extra
}

export interface ResultModel {
  winner: ParticipantModel; // Ganador del desafío
  finalScore: string; // Resultado final (ej.: "3-2")
  isDraw: boolean; // Indica si hubo empate
  summary?: string; // Resumen adicional del resultado
}
