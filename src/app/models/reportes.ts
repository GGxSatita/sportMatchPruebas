
export interface Reporte {
    id?: string;
    usuarioId: string;
    reportadoId: string;
    adminId?: string;
    tipoReporte: string;
    razon: 'Retraso' | 'Mala competitividad' | 'Tóxico' | 'Otro';
    mensaje: string;
    detallesAdicionales?: string;
    estado: 'Abierto' | 'En progreso' | 'Cerrado';
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    respuesta?: string;
    visibleUsuario: boolean;
    fechaExpiracionSancion?: Date;
  }
