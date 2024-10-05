import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Deporte } from './../models/deporte';  // Asegúrate de importar la interfaz

@Injectable({
  providedIn: 'root'
})
export class DeportesService {

  constructor(private firestore: Firestore) {}

  // Obtener los deportes disponibles desde Firestore
  getDeportes(): Observable<Deporte[]> {
    const deportesRef = collection(this.firestore, 'deportes');
    return collectionData(deportesRef, { idField: 'id' }) as Observable<Deporte[]>;
  }
}
