import { Deporte } from "./deporte"

export interface clubes{

  idClubes?: string,
  nombreClub: string,
  logo: string,
  descripcion: string,
  miembros: string[],
  maxMiembros: number,
  admin: boolean,
  deporteNombre:string[],
  ranking?: number,

}
