import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collectionData,
  docData,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';
import { eventos } from '../models/evento';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private collectionName = 'eventosAlumnos';

  constructor(private firestore: Firestore) {}

  createEvento(evento: eventos): Promise<eventos> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return addDoc(eventosRef, { ...evento })
      .then((docRef) => {
        const eventoConId: eventos = { ...evento, idEventosAlumnos: docRef.id };
        // Actualizar el documento con el ID generado
        return updateDoc(docRef, { idEventosAlumnos: docRef.id }).then(() => {
          console.log('Evento creado con ID:', docRef.id);
          return eventoConId; // Devolver el evento con el ID asignado
        });
      })
      .catch((error) => {
        console.error('Error al crear evento:', error);
        throw error;
      });
  }
  getEventos(): Observable<any[]> {
    const eventosCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(eventosCollection)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()))
    );
  }

  getEvento(id: string): Observable<eventos | undefined> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(eventoDoc) as Observable<eventos | undefined>;
  }

  getEventosConReglas(): Observable<eventos[]> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return from(getDocs(eventosRef)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data() as eventos;
          return { id: doc.id, ...data };
        });
      })
    );
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
