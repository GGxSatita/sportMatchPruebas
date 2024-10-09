import { Injectable } from '@angular/core';
import { evento } from '../models/evento';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoService {


  constructor(
    private firestore: Firestore
  ) { }
  
  getEventos(): Observable<evento[]>{
    const eventosRef = collection(this.firestore, 'eventos');
    return collectionData(eventosRef, { idField: 'id'}) as Observable<evento[]>;

  }
}
