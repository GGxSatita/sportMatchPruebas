import { Deporte } from "./deporte"
import { MiembroClub } from "./miembro-club";

export interface Club{

  idClub?: string,
  nombreClub: string,
  logo: string,
  descripcion: string,
  miembros: MiembroClub[];
  maxMiembros: number,
  adminId: string,
  deporteNombre:string[],
  ranking?: number,
  miembroIds: string[];
}
