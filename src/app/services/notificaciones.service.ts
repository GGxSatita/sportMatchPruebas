import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, collectionData, updateDoc, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AutenticacionService } from './autenticacion.service';
import { Notificacion, NotificacionTipo } from '../models/notificacion';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  constructor(private firestore: Firestore, public authService: AutenticacionService) {}

  // Obtener las notificaciones de un usuario actual, diferenciando entre leídas y no leídas
  getNotificacionesUsuario(leidas: boolean): Observable<Notificacion[]> {
    return new Observable((observer) => {
      from(this.authService.getCurrentUserAsync()).subscribe((user: User | null) => {
        if (user) {
          const notificacionesRef = collection(this.firestore, `users/${user.uid}/notifications`);
          const q = query(notificacionesRef, where('leida', '==', leidas));

          collectionData(q, { idField: 'id' }).subscribe((notificaciones) => {
            observer.next(notificaciones as Notificacion[]);
          });
        }
      });
    });
  }

  // Marcar una notificación específica como leída
  async marcarComoLeida(notificacionId: string, userId: string): Promise<void> {
    try {
      const notificacionRef = doc(this.firestore, `users/${userId}/notifications/${notificacionId}`);
      await updateDoc(notificacionRef, { leida: true });
      console.log(`Notificación ${notificacionId} marcada como leída.`);
    } catch (error) {
      console.error('Error al marcar la notificación como leída:', error);
    }
  }

  // Marcar todas las notificaciones de un usuario como leídas
  async marcarTodasComoLeidas(userId: string): Promise<void> {
    try {
      const notificacionesRef = collection(this.firestore, `users/${userId}/notifications`);
      const q = query(notificacionesRef, where('leida', '==', false));
      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map((doc) => updateDoc(doc.ref, { leida: true }));
      await Promise.all(updatePromises);

      console.log(`Todas las notificaciones de ${userId} han sido marcadas como leídas.`);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  }

  // Enviar una nueva notificación personalizada a un usuario, con un tipo de notificación opcional
  async enviarNotificacion(userId: string, mensaje: string, titulo: string, tipo: NotificacionTipo = NotificacionTipo.AVISO) {
    try {
      const notificationRef = doc(this.firestore, `users/${userId}/notifications/${new Date().getTime()}`);
      const notificationData: Notificacion = {
        titulo,
        mensaje,
        tipo,
        timestamp: new Date(),
        leida: false,
      };

      await setDoc(notificationRef, notificationData);
      console.log('Notificación enviada al usuario:', userId);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  }
}
