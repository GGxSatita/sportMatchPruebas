/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
initializeApp()

import { Notifications } from './notifications';


export const sendDynamicNotification = functions.https.onRequest(async (request, response) => {
    try {
      // Extrae los parámetros del cuerpo de la solicitud
      let { tokens, message, data } = request.body;
      console.log('Request body:', request.body);


      // Si el cuerpo es una cadena de texto (en lugar de un objeto JSON), conviértelo a JSON
        if (typeof request.body === 'string') {
          try{
            request.body = JSON.parse(request.body);
            tokens = request.body.tokens;
            message = request.body.message;
            data = request.body.data;
        }catch (e) {
          console.error('Invalid JSON:', e);
          response.status(400).send('Invalid JSON format');
          return;
      }
    }

      // Verifica que todos los parámetros necesarios estén presentes
      if (!tokens || !message || !message.title || !message.content) {
        response.status(400).send('Missing parameters: tokens, message.title, and message.content are required',  );
        return; // Aseguramos que la función termina aquí
      }

      // Llama a tu función para enviar la notificación
      await Notifications.sendNotificationPush(tokens, message, data);

      // Responde con un mensaje de éxito
      response.status(200).send('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      response.status(500).send('Failed to send notification');
    }
  });

  /**
const message = {
    tittle: 'Demo Noti',
    content: 'Desde functions'
}

const tokens = ['fMX753snSpe737VWbUq1ii:APA91bENSxoNvUh4s3LWoB4nzGGkObi14mwSc2VQlkIj5WJ2qsoYjno0kySOcL-b8N3UVU5QaP6JQ5sznGQB7XNGl4dsjFkhlbehlmHvekQidBihs63Endw']

const data = {
    enlace : 'home'
}
Notifications.sendNotificationPush(tokens, message, data)*/
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
