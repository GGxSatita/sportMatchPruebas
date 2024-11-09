import { Injectable } from '@angular/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificacionNativaService {
  constructor() {
    this.initializePushNotifications();
  }

  private initializePushNotifications() {
    // Solicitar permiso para las notificaciones
    PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        // Registrar el dispositivo para recibir notificaciones
        PushNotifications.register();
      }
    });

    // Escuchar el token de registro de notificaciones
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token de registro:', token.value);
      // Aquí puedes enviar el token al backend para vincularlo con el usuario
    });

    // Manejar errores de registro
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error de registro de notificaciones:', error);
    });

    // Escuchar cuando se recibe una notificación en primer plano
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('Notificación recibida en primer plano:', notification);
      // Aquí puedes manejar la notificación directamente
    });

    // Escuchar cuando el usuario hace clic en una notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
      console.log('Acción de notificación realizada:', action);
      // Maneja la acción, por ejemplo, redirigir a una página específica
    });
  }

  // Método para obtener el token (opcional, por si necesitas usarlo en otro componente)
  public getToken() {
    return PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        return PushNotifications.register();
      }
      return null;
    });
  }
}
