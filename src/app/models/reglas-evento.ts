export type SportType = 'FUTBOL' | 'TENIS' | 'BASQUETBOL' | 'VOLEIBOL' | 'OTRO';
export type ChallengeStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';
export type ChallengeType =
  | 'PUNTOS'
  | 'GOLES'
  | 'SETS'
  | 'PARTIDO'
  | 'OBJETIVO';

  export interface ParticipantModel {
    id: string; // ID del usuario
    name: string;
    victories: number;
    score: number;
    eventId?: string; // Relación con el evento
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
