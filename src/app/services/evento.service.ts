import { Injectable } from '@angular/core';
import { eventos } from '../models/evento';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoService {


  constructor(
    private firestore: Firestore
  ) { }

  getEventos(): Observable<eventos[]>{
    const eventosRef = collection(this.firestore, 'eventosAdmin');
    return collectionData(eventosRef, { idField: 'id'}) as Observable<eventos[]>;

  }
}
