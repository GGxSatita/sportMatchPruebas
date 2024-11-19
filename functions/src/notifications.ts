import { getMessaging, MulticastMessage} from 'firebase-admin/messaging';

const messaging = getMessaging()

const sendNotificationPush = async (
    tokens: string[],
    message: {title : string, content: string, image?: string},
    data : any = {},
    tag : string = null) => {
        console.log('Push demo sendNotification activa');
        const multicastMessage: MulticastMessage = {
            tokens,
            data,
            notification: {
                title: message.title,
                body: message.content,
            },
            android: {
                notification: {
                    priority: 'max',
                    visibility : 'public',
                    tag, //Opcional, si se especifica
                }
            },




        }
        const response = await messaging.sendEachForMulticast(multicastMessage);
        console.log('response ->', response.successCount)

    }

export const Notifications = {
    sendNotificationPush
}
