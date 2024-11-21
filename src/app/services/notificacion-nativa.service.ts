import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AutenticacionService } from './autenticacion.service';

@Injectable({
  providedIn: 'root'
})export class NotificacionNativaService {
  // private pushNotificationApiUrl = "https://us-central1-sportmach-fc07f.cloudfunctions.net/sendPushNotification";
  private pushNotificationApiUrl = "https://us-central1-sportmach-fc07f.cloudfunctions.net/sendDynamicNotification"

  constructor(
    private alertController: AlertController,
    private firestore: Firestore,
    private authService: AutenticacionService
  ) {}

  // Método para enviar notificación push
  // public async enviarPushNotification(userId: string, mensaje: string) {
  //   try {
  //     const response = await fetch(this.pushNotificationApiUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         userId: userId,
  //         message: mensaje
  //       })
  //     });

  //     if (response.ok) {
  //       console.log('Notificación push enviada al usuario:', userId);
  //     } else {
  //       console.error('Error al enviar la notificación push:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error en la solicitud de notificación push:', error);
  //   }
  // }

  // init() {
  //   console.log('Initializing NotificationPushService');
  //   PushNotifications.requestPermissions().then(result => {
  //     if (result.receive === 'granted') {
  //       PushNotifications.register();
  //     } else {
  //       this.presentAlert('Atención', 'Por favor, habilita las notificaciones en la configuración del dispositivo.');
  //     }
  //   }).catch(error => {
  //     console.error('Error en solicitud de permisos:', error);
  //   });
  //   this.addListener();
  // }
  init() {
    console.log('Initializing NotificationPushService');
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        this.presentAlert('Atención', 'Por favor, habilita las notificaciones en la configuración del dispositivo.');
      }
    }).catch(error => {
      console.error('Error en solicitud de permisos:', error);
    });
    this.addListener();
  }

  public async enviarPushNotification(userId: string, message: { title: string; content: string; }) {
    try {
      // Obtén el token FCM del usuario desde Firestore
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      if (!userData || !userData['fcmToken']) {
        console.error('Token FCM no encontrado para el usuario:', userId);
        return;
      }

      // Envía la solicitud a la función de Firebase
      const response = await fetch(this.pushNotificationApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: [userData['fcmToken']],
          message: {
            title: message.title,
            content: message.content,
          },
          data: {},
        }),
      });

      if (response.ok) {
        console.log('Notificación push enviada al usuario:', userId);
      } else {
        console.error('Error al enviar la notificación push:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud de notificación push:', error);
    }
  }
  addListener() {
    PushNotifications.addListener('registration', async (token: Token) => {
      console.info('Registration token: ', token.value);
      this.presentAlert('Importante', `Registro completado, el token es: ${token.value}`);
      await this.saveTokenToFirestore(token.value);
      console.log("Token FCM almacenado en Firestore:", token.value);
    });

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.error('Registration error: ', error);
        this.presentAlert('Error', `Registro fallido: ${JSON.stringify(error)}`);
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        this.presentAlert('Notificación recibida', `${notification.body}`);
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        this.presentAlert('Notificación en segundo plano', `${JSON.stringify(notification)}`);
      }
    );
  }

  async saveTokenToFirestore(fcmToken: string) {
    const user = await this.authService.getCurrentUserAsync();
    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    const userDocRef = doc(this.firestore, `Users/${user.uid}`);
    await setDoc(userDocRef, { fcmToken }, { merge: true });
    console.log("Token FCM almacenado en Firestore");
  }

  async getDeliveredNotifications() {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('Delivered notifications: ', notificationList);
  }

  async presentAlert(
    header: string,
    message: string,
    buttonText: string = 'OK',
    subHeader: string = '',
    cssClass: string = ''
  ): Promise<void> {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message,
      buttons: [
        {
          text: buttonText,
          role: 'confirm'
        }
      ],
      cssClass
    });

    await alert.present();
  }

}
