import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, collectionData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { AutenticacionService } from './autenticacion.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  constructor(private firestore: Firestore, private authService: AutenticacionService) {}

  getNotificacionesUsuario(): Observable<any[]> {
    return new Observable((observer) => {
      // Usar la versión asíncrona para obtener el usuario actual
      from(this.authService.getCurrentUserAsync()).subscribe((user: User | null) => {
        if (user) {
          const notificacionesRef = collection(this.firestore, 'notificaciones');
          const q = query(notificacionesRef, where('userId', '==', user.uid));

          collectionData(q, { idField: 'id' }).subscribe((notificaciones) => {
            observer.next(notificaciones);
          });
        }
      });
    });
  }

  async notificarExpulsion(userId: string, clubNombre: string) {
    try {
      console.log('Enviando notificación a usuario con ID:', userId);

      const notificationRef = doc(this.firestore, `users/${userId}/notifications/${new Date().getTime()}`);
      const notificationData = {
        message: `Has sido expulsado del club: ${clubNombre}.`,
        timestamp: new Date()
      };

      await setDoc(notificationRef, notificationData);
      console.log('Notificación enviada al usuario:', userId);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  }
}
