import { Injectable } from '@angular/core';
import { eventosAlumnos } from '../models/evento';
import { Firestore, collectionData, collection, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoService {


  constructor(
    private firestore: Firestore
  ) { }

  getEventos(): Observable<eventosAlumnos[]>{
    const eventosRef = collection(this.firestore, 'eventosAdmin');
    return collectionData(eventosRef, { idField: 'id'}) as Observable<eventosAlumnos[]>;

  }

  agregarEvento(evento: eventosAlumnos): Promise<void> {
    const eventosRef = collection(this.firestore, 'eventosAdmin');
    return addDoc(eventosRef, evento).then(() => {
      console.log('Evento agregado exitosamente');
    }).catch((error) => {
      console.error('Error al agregar el evento: ', error);
    });
  }
}
