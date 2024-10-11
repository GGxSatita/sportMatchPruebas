export class eventos {
  constructor(
    public idEventosAlumnos: string,
    public idSector: string,
    public titulo: string,
    public descripcion: string,
    public espera: boolean,
    public image: string,
    public fechaReservada: string,
    public sectorNombre?: string,
    public capacidadAlumnos?: number,
    public creator?: string,
    public status?: boolean,
  ) {}
}


