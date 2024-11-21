export interface EnfrentamientoModel {
  id: string; // ID único del enfrentamiento
  participantes: {
    id: string;
    name: string;
    score: number;
  }[];
  ganador?: {
    id: string;
    name: string;
    score: number;
  };
  fecha: Date; // Fecha del enfrentamiento
}
