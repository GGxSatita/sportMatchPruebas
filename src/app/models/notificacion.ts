import firebase from 'firebase/compat/app';
export interface Notificacion {
  id?: string;                       // ID opcional, generado automáticamente
  titulo: string;                    // Título breve de la notificación
  mensaje: string;                   // Descripción o mensaje de la notificación
  tipo: NotificacionTipo;            // Tipo de notificación, usando un enum
  timestamp: firebase.firestore.Timestamp | Date;                 // Fecha y hora de creación de la notificación
  leida: boolean;                    // Estado de lectura de la notificación
  icono?: string;                    // Icono opcional asociado a la notificación
  usuarioId?: string;                // ID del usuario destinatario, si es una notificación individual
  prioridad?: 'alta' | 'media' | 'baja'; // Nivel de prioridad (opcional)
}

// Enum para definir los tipos de notificaciones
export enum NotificacionTipo {
  EVENTO = 'evento',
  AVISO = 'aviso',
  ALERTA = 'alerta',
  MENSAJE = 'mensaje'
}
