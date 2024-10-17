import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { clubes } from '../models/clubes';



@Injectable({
  providedIn: 'root',
})
export class ClubesService {
  private collectionName = 'clubes';

  constructor(private firestore: Firestore) {}

  // Crear un nuevo club
  addClub(club: clubes): Promise<any> {
    const clubesRef = collection(this.firestore, this.collectionName);
    return addDoc(clubesRef, { ...club });
  }

  // Obtener todos los clubes
  getClubes(): Observable<clubes[]> {
    const clubesRef = collection(this.firestore, this.collectionName);
    return collectionData(clubesRef, { idField: 'id' }) as Observable<clubes[]>;
  }

  // Obtener un club por ID
  getClubById(id: string): Observable<clubes | undefined> {
    const clubDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(clubDoc) as Observable<clubes | undefined>;
  }

  // Actualizar un club
  updateClub(id: string, club: Partial<clubes>): Promise<void> {
    const clubDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(clubDoc, { ...club });
  }

  // Eliminar un club
  deleteClub(id: string): Promise<void> {
    const clubDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(clubDoc);
  }
}
