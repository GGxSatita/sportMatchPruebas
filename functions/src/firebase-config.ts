import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Inicializa Firebase solo si no está ya inicializado
if (!getApps().length) {
  initializeApp();
}

export const firestore = getFirestore();
export const messaging = getMessaging();
