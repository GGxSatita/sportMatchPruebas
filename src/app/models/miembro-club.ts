import { ModelsAuth } from "./auth.models";

export interface MiembroClub {
  userId: string;
  profile?: ModelsAuth.UserProfile; // Agrega esta propiedad si necesitas almacenar el perfil
  role: 'lider' | 'member';
  fechaIngre?: Date;
  puntos?: number;
}
