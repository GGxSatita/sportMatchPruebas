import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, catchError } from 'rxjs';
import { eventos } from '../models/evento';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private collectionName = 'eventosAdmin';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Crear un nuevo evento
  createEvento(evento: eventos): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.collectionName).doc(id).set({ ...evento, idEventosAdmin: id })
      .catch(error => {
        console.error("Error creando evento: ", error);
        throw error; // Propagar el error si es necesario
      });
  }

  // Obtener todos los eventos
  getEventos(): Observable<eventos[]> {
    return this.firestore.collection<eventos>(this.collectionName).valueChanges()
      .pipe(catchError(error => {
        console.error("Error obteniendo eventos: ", error);
        throw error; // Propagar el error si es necesario
      }));
  }

  // Obtener un evento por ID
  getEvento(id: string): Observable<eventos | undefined> {
    return this.firestore.collection<eventos>(this.collectionName).doc(id).valueChanges()
      .pipe(catchError(error => {
        console.error(`Error obteniendo evento con ID ${id}: `, error);
        throw error; // Propagar el error si es necesario
      }));
  }

  // Actualizar un evento
  updateEvento(id: string, evento: eventos): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).update(evento)
      .catch(error => {
        console.error(`Error actualizando evento con ID ${id}: `, error);
        throw error; // Propagar el error si es necesario
      });
  }

  // Eliminar un evento
  deleteEvento(id: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).delete()
      .catch(error => {
        console.error(`Error eliminando evento con ID ${id}: `, error);
        throw error; // Propagar el error si es necesario
      });
  }
}
