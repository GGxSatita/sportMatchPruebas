export class eventos {
  idEventosAdmin: string;
  idSector: string;
  titulo: string;
  descripcion: string;
  creator: string;
  status: boolean;
  image: string;
  fechaReservada: string;
  idCreator: string;
  participants: string[];
  sectorNombre?:string;
  capacidadAlumnos?: number;


  constructor(
    idEventosAdmin: string,
    idSector: string,
    titulo: string,
    descripcion: string,
    creator: string,
    status: boolean,
    idCreator: string,
    image: string ,
    fechaReservada: string,
    participants: string[] = []
  ) {
    this.idEventosAdmin = idEventosAdmin;
    this.idSector = idSector;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.creator = creator;
    this.idCreator = idCreator;
    this.status = status;
    this.image = image;
    this.fechaReservada = fechaReservada;
    this.participants = participants;
  }
}
