export interface eventos{
  idEventosAdmin: string;
  idSector: string;
  titulo: string;
  descripcion: string;
  creator: string;
  status: boolean;
  image: string;
  fechaReservada: string;
  sectorNombre?:string;
  capacidadAlumnos?: number;
}
