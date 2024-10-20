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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Club } from '../models/club';
import { CollectionReference, DocumentReference } from 'firebase/firestore';
import { ChatMessage } from '../models/chatMessage';

@Injectable({
  providedIn: 'root',
})
export class ClubesService {
  private clubsCollection: CollectionReference<Club>;

  constructor(private firestore: Firestore) {
    // Obtén la referencia de la colección 'clubs'
    this.clubsCollection = collection(
      this.firestore,
      'clubs'
    ) as CollectionReference<Club>;
  }

  // Método para crear un nuevo club
  async createClub(club: Club, userId: string): Promise<string> {
    const clubRef = doc(this.clubsCollection);
    const clubData = {
      ...club,
      idClub: clubRef.id,
      miembroIds: club.miembros.map(miembro => miembro.userId) // Asegurar que miembroIds solo contiene userId
    };

    await setDoc(clubRef, clubData);
    console.log('Club creado con ID:', clubRef.id);
    return clubRef.id;
  }



  // Método para obtener un club por ID
  getClubById(clubId: string): Observable<Club | undefined> {
    const docRef = doc(this.firestore, `clubs/${clubId}`);
    return docData(docRef, { idField: 'idClub' }) as Observable<
      Club | undefined
    >;
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
      // Verificar si 'miembroIds' es un array
      if (Array.isArray(clubData.miembroIds)) {
        return clubData.miembroIds.includes(userId);
      }
    }
    return false;
  }

  // Método para eliminar un miembro del club
  async eliminarMiembro(clubId: string, miembroId: string): Promise<void> {
    const clubRef = doc(this.firestore, `clubs/${clubId}`);
    const clubSnap = await getDoc(clubRef);
    if (clubSnap.exists()) {
      const clubData = clubSnap.data() as Club;
      if (Array.isArray(clubData.miembros)) {
        const updatedMembers = clubData.miembros.filter(
          (miembro) => miembro.userId !== miembroId
        );
        const updatedMemberIds = updatedMembers.map(miembro => miembro.userId);

        await updateDoc(clubRef, {
          miembros: updatedMembers,
          miembroIds: updatedMemberIds,
        });
      } else {
        console.error('Los miembros no están definidos o no son un array.');
      }
    } else {
      throw new Error('Club no encontrado');
    }
  }

  // Método para obtener el club al que pertenece un usuario
  async getClubForUser(userId: string): Promise<Club | null> {
    console.log('Buscando club para el usuario con ID:', userId); // Verificar el ID que se pasa
    const clubsRef = collection(this.firestore, 'clubs');
    const q = query(clubsRef, where('miembroIds', 'array-contains', userId)); // Usando el nuevo campo `miembroIds`
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const clubDoc = querySnapshot.docs[0];
        console.log('Club encontrado:', clubDoc.data()); // Verificar qué club se obtiene
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
        console.warn('No se encontró ningún club para el usuario'); // Mensaje si no se encuentra el club
        return null;
    }
}




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
      timestamp: new Date(), // Si estás usando Firestore, ajusta para usar Firestore Timestamp
      userPhotoUrl,
    };

    await addDoc(
      collection(this.firestore, `clubs/${clubId}/messages`),
      newMessage
    );
  }
}
