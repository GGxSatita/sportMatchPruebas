import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  docData,
  setDoc,
  getDoc,
  where,
  query,
  getDocs,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Club } from '../models/club';
import { CollectionReference } from 'firebase/firestore';
import { ChatMessage } from '../models/chatMessage';
import { map } from 'rxjs/operators';
import { AutenticacionService } from './autenticacion.service';
import { NotificacionNativaService } from './notificacion-nativa.service';

@Injectable({
  providedIn: 'root',
})
export class ClubesService {
  private clubsCollection: CollectionReference<Club>;


  constructor(
    private firestore: Firestore,
    private authService :AutenticacionService,
    private notificacionNativaService : NotificacionNativaService
  ) {

    // Obtén la referencia de la colección 'clubs'
    this.clubsCollection = collection(this.firestore, 'clubs') as CollectionReference<Club>;
  }
  // Método para abandonar el club
  async abandonarClub(clubId: string, userId: string): Promise<void> {
    try {
      const clubRef = doc(this.firestore, `clubs/${clubId}`);
      const clubSnap = await getDoc(clubRef);

      if (clubSnap.exists()) {
        const clubData = clubSnap.data() as Club;
        const updatedMembers = clubData.miembros.filter((miembro) => miembro.userId !== userId);
        const updatedMemberIds = updatedMembers.map((miembro) => miembro.userId);

        // Actualizar el club en Firestore para eliminar el usuario
        await updateDoc(clubRef, {
          miembros: updatedMembers,
          miembroIds: updatedMemberIds,
        });

        // Actualizar el perfil del usuario para reflejar que no pertenece a ningún club
        const userRef = doc(this.firestore, `Users/${userId}`);
        await updateDoc(userRef, {
          clubId: null // Asegúrate de que este campo refleje la relación con el club
        });

        console.log(`Usuario ${userId} ha abandonado el club ${clubId}.`);
      } else {
        console.error('El club no existe.');
        throw new Error('Club no encontrado');
      }
    } catch (error) {
      console.error('Error al abandonar el club:', error);
      throw error;
    }
  }

  // Método para crear un nuevo club
  async createClub(club: Club, userId: string): Promise<string> {
    const clubRef = doc(this.clubsCollection);
    const clubData = {
      ...club,
      idClub: clubRef.id,
      miembroIds: club.miembros.map((miembro) => miembro.userId),
    };

    await setDoc(clubRef, clubData);
    console.log('Club creado con ID:', clubRef.id);
    return clubRef.id;
  }

  // Método para obtener un club por ID
  getClubById(clubId: string): Observable<Club | null> {
    const docRef = doc(this.firestore, `clubs/${clubId}`);
    return docData(docRef, { idField: 'idClub' }).pipe(
      map((data: any) => {
        if (data) {
          return {
            idClub: clubId,
            nombreClub: data['nombreClub'],
            logo: data['logo'],
            descripcion: data['descripcion'],
            miembros: data['miembros'] || [],
            maxMiembros: data['maxMiembros'],
            adminId: data['adminId'],
            ranking: data['ranking'],
            deporteNombre: data['deporteNombre'],
            miembroIds: data['miembroIds'] || [],
          } as Club;
        } else {
          return null;
        }
      })
    );
  }

  // Método para obtener todos los clubes
  getAllClubs(): Observable<Club[]> {
    return collectionData(this.clubsCollection, {
      idField: 'idClub',
    }) as Observable<Club[]>;
  }

  // Método para actualizar un club
  async updateClub(clubId: string, updatedClub: Partial<Club>): Promise<void> {
    const docRef = doc(this.firestore, `clubs/${clubId}`);
    await updateDoc(docRef, updatedClub);
  }

  // Método para eliminar un club
  async deleteClub(clubId: string): Promise<void> {
    const docRef = doc(this.firestore, `clubs/${clubId}`);
    await deleteDoc(docRef);
  }

  // Método para verificar si un usuario es miembro de un club
  async isUserMemberOfClub(userId: string, clubId: string): Promise<boolean> {
    const clubRef = doc(this.firestore, `clubs/${clubId}`);
    const clubSnap = await getDoc(clubRef);
    if (clubSnap.exists()) {
      const clubData = clubSnap.data() as Club;
      if (Array.isArray(clubData.miembroIds)) {
        return clubData.miembroIds.includes(userId);
      }
    }
    return false;
  }

  // Método para obtener los deportes disponibles
  async getDeportes(): Promise<string[]> {
    const deportesRef = collection(this.firestore, 'deportes'); // Asumiendo que hay una colección 'deportes'
    const snapshot = await getDocs(deportesRef);
    return snapshot.docs.map((doc) => doc.data()['nombre'] as string);
  }

// Método para eliminar un miembro del club
async eliminarMiembro(clubId: string, miembroId: string, nombreClub:string): Promise<void> {
  const clubRef = doc(this.firestore, `clubs/${clubId}`);
  const clubSnap = await getDoc(clubRef);

  if (clubSnap.exists()) {
      const clubData = clubSnap.data() as Club;
      if (Array.isArray(clubData.miembros)) {
          const updatedMembers = clubData.miembros.filter((miembro) => miembro.userId !== miembroId);
          const updatedMemberIds = updatedMembers.map((miembro) => miembro.userId);

          // Actualizar Firestore con la lista de miembros actualizada
          await updateDoc(clubRef, {
              miembros: updatedMembers,
              miembroIds: updatedMemberIds,
          });
          // Marcar la expulsión en el perfil del miembro
          await this.marcarExpulsion(miembroId, nombreClub);

      // Enviar notificación push al usuario
      const mensaje = `Has sido expulsado del club ${nombreClub}.`;
      await this.enviarNotificacionExpulsion(miembroId, mensaje);

      console.log(`Miembro ${miembroId} eliminado del club ${clubId} y notificado.`);

      console.log(`Miembro ${miembroId} eliminado del club ${clubId} y notificado.`);
      } else {
          console.error('Los miembros no están definidos o no son un array.');
      }
  } else {
      console.error('Club no encontrado');
      throw new Error('Club no encontrado');
  }
}
// Nuevo método para integrar con NotificacionNativaService
private async enviarNotificacionExpulsion(userId: string, mensaje: string): Promise<void> {
  try {
    // Llama al servicio de notificaciones nativas para enviar la notificación push
    await this.notificacionNativaService.enviarPushNotification(userId, mensaje);
    console.log('Notificación de expulsión enviada correctamente al usuario:', userId);
  } catch (error) {
    console.error('Error al enviar la notificación de expulsión:', error);
  }

}


// Método para obtener el club al que pertenece un usuario
async getClubForUser(userId: string): Promise<Club | null> {
  try {
    console.log('Buscando club para el usuario con ID:', userId);
    const clubsRef = collection(this.firestore, 'clubs');
    const q = query(clubsRef, where('miembroIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const clubDoc = querySnapshot.docs[0];
      const clubData = clubDoc.data();
      console.log('Club encontrado:', clubData);
      return {
        idClub: clubDoc.id,
        nombreClub: clubData['nombreClub'],
        logo: clubData['logo'],
        descripcion: clubData['descripcion'],
        miembros: clubData['miembros'],
        maxMiembros: clubData['maxMiembros'],
        adminId: clubData['adminId'],
        ranking: clubData['ranking'],
        deporteNombre: clubData['deporteNombre'],
        miembroIds: clubData['miembroIds'],
      } as Club;
    } else {
      console.warn('No se encontró ningún club para el usuario:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error al buscar el club para el usuario:', error);
    return null;
  }
}


  // Método para enviar un mensaje en el chat del club
  async sendMessage(
    clubId: string,
    message: string,
    userId: string,
    username: string,
    userPhotoUrl?: string
  ): Promise<void> {
    const newMessage: ChatMessage = {
      userId,
      username,
      message,
      timestamp: new Date(),
      userPhotoUrl,
    };

    await addDoc(collection(this.firestore, `clubs/${clubId}/messages`), newMessage);
  }
  // Servicio para marcar la expulsión en el perfil del miembro
  async marcarExpulsion(userId: string, clubName: string): Promise<void> {
    try {
      // Obtén la referencia del documento del usuario
      const userRef = doc(this.firestore, `Users/${userId}`);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          expulsado: true,
          clubExpulsado: clubName,
          fechaExpulsion: new Date(),
        });
        console.log(`El usuario ${userId} ha sido marcado como expulsado del club ${clubName}.`);
      } else {
        console.error(`El documento del usuario ${userId} no existe en Firestore.`);
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al marcar la expulsión:', error);
      throw error;
    }
  }


// En ClubesService
getUserDocRef(userId: string): DocumentReference {
  return doc(this.firestore, `Users/${userId}`);
}
// En ClubesService
async eliminarClubYActualizarMiembros(clubId: string): Promise<void> {
  try {
    // Referencia al club en Firestore
    const clubRef = doc(this.firestore, `clubs/${clubId}`);
    const clubSnap = await getDoc(clubRef);

    if (clubSnap.exists()) {
      const clubData = clubSnap.data() as Club;

      // Actualizar cada miembro del club para reflejar que ya no pertenecen a ningún club
      const updateMemberPromises = clubData.miembroIds.map(async (userId) => {
        const userRef = doc(this.firestore, `Users/${userId}`);
        return await updateDoc(userRef, { clubId: null });
      });

      // Esperar a que todos los usuarios se actualicen
      await Promise.all(updateMemberPromises);

      // Luego, eliminar el documento del club en Firestore
      await deleteDoc(clubRef);

      console.log(`Club con ID ${clubId} y todos los miembros actualizados correctamente.`);

      // Opcional: Aquí puedes agregar una lógica para enviar notificaciones a los usuarios
    } else {
      console.error('El club no existe.');
      throw new Error('Club no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar el club y actualizar miembros:', error);
    throw error;
  }
}


// Método para actualizar el perfil del usuario al abandonar el club
async actualizarEstadoUsuarioSinClub(userId: string): Promise<void> {
  try {
    const userRef = doc(this.firestore, `Users/${userId}`);
    await updateDoc(userRef, {
      clubId: null // Actualiza este campo para reflejar que el usuario no pertenece a ningún club
    });
    console.log(`Usuario ${userId} marcado como sin club`);
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    throw error;
  }
}



}
