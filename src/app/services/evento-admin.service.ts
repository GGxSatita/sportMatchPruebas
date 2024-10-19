import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, docData, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { eventos } from '../models/evento-admin';

@Injectable({
  providedIn: 'root'
})
export class EventoAdminService {
  private collectionName = 'eventosAdmin';

  constructor(private firestore: Firestore) {}



  async joinEvento(eventoId: string, alumnoId: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${eventoId}`);

    try {
      const eventoSnap = await getDoc(eventoDoc);
      if (eventoSnap.exists()) {
        const eventoData = eventoSnap.data() as eventos;

        // Verifica si el alumno ya está en la lista
        if (eventoData.participants.includes(alumnoId)) {
          throw new Error('Ya estás registrado en este evento.');
        }

        // Agrega el ID del alumno a la lista de participantes
        await updateDoc(eventoDoc, {
          participants: [...eventoData.participants, alumnoId]
        });
      } else {
        throw new Error('El evento no existe.');
      }
    } catch (error) {
      console.error('Error al unirse al evento:', error);
      throw error;
    }
  }


  createEvento(evento: eventos): Promise<void> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return addDoc(eventosRef, { ...evento })
      .then((docRef) => {
        console.log('Evento creado con ID:', docRef.id);
        // Actualizar el evento con el ID generado
        return updateDoc(docRef, { idEventosAlumnos: docRef.id });
      })
      .catch((error) => {
        console.error('Error al crear evento:', error);
        throw error;
      });
  }
  getEventos(): Observable<eventos[]> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return collectionData(eventosRef, { idField: 'id' }) as Observable<eventos[]>;
  }


  getEvento(id: string): Observable<eventos | undefined> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(eventoDoc) as Observable<eventos | undefined>;
  }

  updateEvento(id: string, evento: Partial<eventos>): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(eventoDoc, { ...evento });
  }


  deleteEvento(id: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(eventoDoc);
  }
}
