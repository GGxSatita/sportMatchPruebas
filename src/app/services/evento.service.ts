import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { eventos } from '../models/evento';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private collectionName = 'eventosAlumnos';

  constructor(private firestore: Firestore) {}

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

  updateEvento(id: string, evento: eventos): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(eventoDoc, { ...evento });
  }

  deleteEvento(id: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(eventoDoc);
  }
}
