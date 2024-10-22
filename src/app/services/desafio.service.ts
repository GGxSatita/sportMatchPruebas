import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, setDoc, DocumentData } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Desafio } from '../models/desafio';
import { eventos } from '../models/evento';

@Injectable({
  providedIn: 'root',
})
export class DesafioService {
  private collectionName = 'desafios';

  constructor(private firestore: Firestore) {}

  // Obtener todos los desafíos
  getDesafios(): Observable<Desafio[]> {
    const desafiosRef = collection(this.firestore, this.collectionName);
    return collectionData(desafiosRef, { idField: 'id' }) as Observable<Desafio[]>;
  }

  // Obtener un desafío por ID
  getDesafioById(id: string): Observable<Desafio | undefined> {
    const desafioDoc = doc(this.firestore,`${this.collectionName}/${id}`);
    return docData(desafioDoc, { idField: 'id' }) as Observable<Desafio | undefined>;
  }

  // Crear un nuevo desafío
  async createDesafio(desafio: Desafio): Promise<void> {
    const desafiosRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(desafiosRef, { ...desafio });
    console.log('Desafío creado con ID:', docRef.id);

    // Actualiza el documento con el ID generado automáticamente
    await updateDoc(docRef, { id: docRef.id });
  }

  // Actualizar un desafío existente
  updateDesafio(id: string, updatedData: Partial<Desafio>): Promise<void> {
    const desafioDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(desafioDoc, { ...updatedData });
  }

  // Eliminar un desafío por ID
  deleteDesafio(id: string): Promise<void> {
    const desafioDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(desafioDoc);
  }

  getEventStatus(eventId: string): Observable<string> {
    const eventDoc = doc(this.firestore, `eventos/${eventId}`);
    return docData(eventDoc).pipe(
      map((doc: DocumentData) => {
        const event = doc as eventos; // Casting a 'eventos'
        if (event.participantesActuales.length >= event.capacidadMaxima) {
          return 'FULL';
        } else {
          return 'PENDING';
        }
      })
    ) as Observable<string>;
  }
}
