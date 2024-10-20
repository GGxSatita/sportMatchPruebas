export interface ChatMessage {
  userId: string;
  username: string; // Alias o nombre visible del usuario
  message: string;
  timestamp: any; // Ajuste para utilizar Firestore Timestamp (podrías usar también `firebase.firestore.Timestamp` si lo prefieres)
  userPhotoUrl?: string; // URL de la foto del perfil del usuario (opcional)
}
