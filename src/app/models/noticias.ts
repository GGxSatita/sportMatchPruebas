export class Noticias {
  idNoticias: string;
  titulo: string;
  cuerpo: string;
  imagen: string | null; // Cambia File a string si estás usando URLs
  activo: boolean;
  fecha: Date;
  categoria: string;
  autor: string;
  showDetails?: boolean; // Propiedad opcional para manejar la visibilidad

  constructor(
    idNoticias: string,
    titulo: string,
    cuerpo: string,
    imagen: string | null,
    activo: boolean,
    fecha: Date,
    categoria: string,
    autor: string
  ) {
    this.idNoticias = idNoticias;
    this.titulo = titulo;
    this.cuerpo = cuerpo;
    this.imagen = imagen;
    this.activo = activo;
    this.fecha = fecha;
    this.categoria = categoria;
    this.autor = autor;
    this.showDetails = false; // Inicializa en false
  }
}
