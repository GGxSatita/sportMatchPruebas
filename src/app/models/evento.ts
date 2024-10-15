export class eventos {
  constructor(
    public idEventosAlumnos: string = '',
    public idSector: string = '',
    public titulo: string = '',
    public descripcion: string = '',
    public espera: boolean = false,
    public image: string = '',
    public fechaReservada: string = '',
    public hora?: string,
    public sectorNombre?: string,
    public capacidadAlumnos?: number
  ) {}
}
