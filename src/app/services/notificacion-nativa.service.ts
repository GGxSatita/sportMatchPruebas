import { Injectable, inject } from '@angular/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { AlertController } from '@ionic/angular';
import { push } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class NotificacionNativaService {

  constructor(private alertController: AlertController) {}

  init(){
    console.log('Initializing NotificationPushService');
    PushNotifications.requestPermissions().then(result=>{
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
        //Agregar un aler controller o similar que diga que debe habilitar las notificaciones
      }
    });
    this.addListener();
  }

  addListener(){
    PushNotifications.addListener('registration',
    (token:Token)=>{
      this.presentAlert('Importante', `Registro provideExperimentalCheckNoChangesForDebug, el token es : ${token.value}`)
      }
    );
    PushNotifications.addListener('registrationError',
      (error:any)=>{
        this.presentAlert('Error',`Registro fallido`)
      }
    );
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed)=>{
        this.presentAlert('Notificación en segundo plano', `${JSON.stringify(notification)}`)
      }
    )

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
