export interface evento{
    idEvento?:string;
    idSectores: string;
    nombre:string;
    hora:string;
    fecha: string;
    descripcion?:string;
    capacidad: number;
    image:File;
    aprobado?: boolean;
}