export interface Horario{
    dia: string;
    inicio: string;
    fin: string;
    disponible: boolean;
    fechasReservadas?: string[];
}


export interface Sectores{
  idSector: string;
  nombre: string;
  image: string | null;
  horarios: Horario[];
  visible: boolean;
  visibleVer:string;
  description?: string;
  capacidad?: number;

}
