import * as functions from 'firebase-functions';
import * as cors from 'cors'; // Importa CORS
import { Notifications } from './notifications';

// Configura CORS
const corsHandler = cors({ origin: true });

export const sendDynamicNotification = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      let { tokens, message, data } = request.body;
      console.log('Request body:', request.body);

      // Si el cuerpo es una cadena de texto (en lugar de un objeto JSON), conviértelo a JSON
      if (typeof request.body === 'string') {
        try {
          request.body = JSON.parse(request.body);
          tokens = request.body.tokens;
          message = request.body.message;
          data = request.body.data;
        } catch (e) {
          console.error('JSON inválido:', e);
          response.status(400).send('Formato JSON inválido');
          return;
        }
      }

      // Verifica que todos los parámetros necesarios estén presentes
      if (!tokens || !message || !message.title || !message.content) {
        response.status(400).send('Faltan parámetros: se requieren tokens, message.title y message.content');
        return;
      }

      // Llama a tu función para enviar la notificación
      await Notifications.sendNotificationPush(tokens, message, data);

      // Responde con un mensaje de éxito
      response.status(200).send('Notificación enviada con éxito');
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      response.status(500).send('Error al enviar la notificación');
    }
  });
});
