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
  name: string; // Nombre del participante
  victories: number; // Número de victorias
  score: number; // Puntuación individual
  team?: string; // Equipo al que pertenece (opcional, por ejemplo, 'equipo1' o 'equipo2')
  eventId?: string; // Relación con el evento
  photo?: string;
}

export interface ReglasModel {
  id: string; // ID único de las reglas
  creatorId: string; // ID del usuario que creó las reglas
  eventId: string; // ID del evento asociado
  pointsToWin?: number; // Puntos necesarios para ganar
  reglasAdicionales?: string; // Reglas adicionales (opcional)
  esPorEquipos?: boolean; // Indica si el evento es por equipos
}

export interface ResultModel {
  winner: ParticipantModel | string; // Ganador del desafío (puede ser un participante o un equipo)
  finalScore: string; // Resultado final (ej.: "3-2" o puntaje acumulado de equipos)
  isDraw: boolean; // Indica si hubo empate
  summary?: string; // Resumen adicional del resultado
}
