export type ChallengeType = 'PUNTOS' | 'GOLES' | 'SETS' | 'PARTIDO' | 'OBJETIVO';
export type SportType = 'FUTBOL' | 'TENIS' | 'BASQUETBOL' | 'VOLEIBOL' | 'OTRO';
export type ChallengeStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO';

import { eventos } from './evento'; // Asegúrate del path correcto
import { Deporte } from './deporte';

export interface ParticipantModel {
  id: string; // ID del alumno (UID de Firebase)
  name: string; // Nombre del jugador o equipo
  score: number; // Puntos acumulados o goles anotados
  setsWon?: number; // Sets ganados (para deportes de sets)
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
  id: string; // ID del desafío
  name: string; // Nombre del desafío
  type: ChallengeType; // Tipo de desafío
  sport: Deporte; // Deporte asociado
  status: ChallengeStatus; // Estado del desafío
  participants: ParticipantModel[]; // Lista de participantes
  rules: RulesModel; // Reglas del desafío
  event: eventos; // Evento asociado al desafío
  results?: ResultModel; // Resultado del desafío, si aplica
}

