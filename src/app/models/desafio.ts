
export type SportType = 'FUTBOL' | 'TENIS' | 'BASQUETBOL' | 'VOLEIBOL' | 'OTRO';
import { eventos } from './evento'; // Asegúrate del path correcto
import { Deporte } from './deporte';
export type ChallengeStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';
export type ChallengeType = 'PUNTOS' | 'GOLES' | 'SETS' | 'PARTIDO' | 'OBJETIVO';

export interface ParticipantModel {
  id: string; // ID del usuario
  name: string;
  victories: number;
  score: number;
  equipo?: string; // Nombre del equipo al que pertenece el jugador
  eventId?: string; // Relación con el evento
  photo?: string;
  // activo: boolean;
}

export interface RulesModel {
  maxPoints?: number; // Puntos máximos para ganar
  maxGoals?: number; // Goles máximos para ganar
  setsToWin?: number; // Número de sets necesarios para ganar
  timeLimit?: number; // Límite de tiempo en minutos
}

export interface ResultModel {
  winner: ParticipantModel; // Ganador del desafío
  finalScore: string; // Resultado final (ej.: "3-2")
  isDraw: boolean; // Indica si hubo empate
  summary?: string; // Resumen adicional del resultado
}

export interface Desafio {
  id: string; // ID único del desafío
  type: ChallengeType; // Tipo de desafío (goles, puntos, etc.)
  sport: Deporte; // Deporte asociado
  status: ChallengeStatus; // Estado del desafío (en progreso, finalizado, etc.)
  participants: ParticipantModel[]; // Lista de participantes
  rules: RulesModel; // Reglas del desafío
  results?: ResultModel; // Resultado del desafío
}

export interface ScoreModel {
  id: string;        // ID único del usuario
  name: string;      // Nombre del usuario
  score: number;     // Puntuación acumulada
  victories: number; // Número de victorias
  rank: string;      // Rango del jugador (Principiante, Intermedio, Avanzado, Experto, etc.)
}
