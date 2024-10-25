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

@Injectable({
  providedIn: 'root',
})
export class ClubesService {
  private clubsCollection: CollectionReference<Club>;

  constructor(private firestore: Firestore) {
    // Obtén la referencia de la colección 'clubs'
    this.clubsCollection = collection(this.firestore, 'clubs') as CollectionReference<Club>;
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
// Método para eliminar un miembro del club
async eliminarMiembro(clubId: string, miembroId: string): Promise<void> {
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
      } else {
          console.error('Los miembros no están definidos o no son un array.');
      }
  } else {
      console.error('Club no encontrado');
      throw new Error('Club no encontrado');
  }
}



  // Método para obtener el club al que pertenece un usuario
  async getClubForUser(userId: string): Promise<Club | null> {
    console.log('Buscando club para el usuario con ID:', userId);
    const clubsRef = collection(this.firestore, 'clubs');
    const q = query(clubsRef, where('miembroIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const clubDoc = querySnapshot.docs[0];
      console.log('Club encontrado:', clubDoc.data());
      const clubData = clubDoc.data();
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
      console.warn('No se encontró ningún club para el usuario');
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
      const userRef = doc(this.firestore, `users/${userId}`);
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
  return doc(this.firestore, `users/${userId}`);
}
// En ClubesService
async eliminarClub(clubId: string): Promise<void> {
  try {
    // Eliminar la colección 'miembros' y otras subcolecciones si existen
    const clubRef = doc(this.firestore, `clubs/${clubId}`);
    await deleteDoc(clubRef);
    console.log('Club eliminado con ID:', clubId);
  } catch (error) {
    console.error('Error al eliminar el club:', error);
    throw error;
  }
}




}
