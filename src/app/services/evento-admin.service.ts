import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, docData, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { eventosAdmin } from '../models/evento-admin';

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
        const eventoData = eventoSnap.data() as eventosAdmin;

        // Verifica si el alumno ya está en la lista
        if (eventoData.participants.some(part => part.idAlumno === alumnoId)) {
          throw new Error('Ya estás registrado en este evento.');
        }

        // Agrega el objeto del alumno a la lista de participantes
        await updateDoc(eventoDoc, {
          participants: [...eventoData.participants, { idAlumno: alumnoId, llego: false }]
        });
      } else {
        throw new Error('El evento no existe.');
      }
    } catch (error) {
      console.error('Error al unirse al evento:', error);
      throw error;
    }
  }



  createEvento(evento: eventosAdmin): Promise<void> {
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
  getEventos(): Observable<eventosAdmin[]> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return collectionData(eventosRef, { idField: 'id' }) as Observable<eventosAdmin[]>;
  }


  getEvento(id: string): Observable<eventosAdmin | undefined> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(eventoDoc) as Observable<eventosAdmin | undefined>;
  }

  updateEvento(id: string, evento: Partial<eventosAdmin>): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(eventoDoc, { ...evento });
  }


  deleteEvento(id: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(eventoDoc);
  }

  async marcarLlegada(eventoId: string, alumnoId: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${eventoId}`);

    try {
      const eventoSnap = await getDoc(eventoDoc);
      if (eventoSnap.exists()) {
        const eventoData = eventoSnap.data() as eventosAdmin;

        // Busca el participante por su ID
        const participanteIndex = eventoData.participants.findIndex(part => part.idAlumno === alumnoId);

        if (participanteIndex === -1) {
          throw new Error('El alumno no está inscrito en este evento.');
        }

        // Actualiza el campo 'llego' a true
        eventoData.participants[participanteIndex].llego = true;

        // Actualiza el evento en Firestore
        await updateDoc(eventoDoc, {
          participants: eventoData.participants
        });
      } else {
        throw new Error('El evento no existe.');
      }
    } catch (error) {
      console.error('Error al marcar llegada:', error);
      throw error;
    }
  }

}
