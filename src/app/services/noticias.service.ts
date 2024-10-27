import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Noticias } from '../models/noticias';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {

  private noticiasCollection = collection(this.firestore, 'noticias');

  constructor(private firestore: Firestore) { }

  // Método para obtener todas las noticias
  getNoticias(): Observable<Noticias[]> { // Cambiado de getNoticia a getNoticias
    return collectionData(this.noticiasCollection, { idField: 'idNoticias' }) as Observable<Noticias[]>;
  }

  // Método para agregar una noticia
  addNoticia(noticia: Noticias): Promise<void> {
    return addDoc(this.noticiasCollection, noticia).then();
  }

  // Método para actualizar una noticia
  updateNoticia(noticia: Noticias): Promise<void> {
    const noticiaDoc = doc(this.firestore, `noticias/${noticia.idNoticias}`);
    return updateDoc(noticiaDoc, { ...noticia });
  }

  // Método para eliminar una noticia
  deleteNoticia(id: string): Promise<void> {
    const noticiaDoc = doc(this.firestore, `noticias/${id}`);
    return deleteDoc(noticiaDoc);
  }

  // Método para obtener una noticia por ID
  getNoticiaById(id: string): Observable<Noticias> {
    const noticiaDoc = doc(this.firestore, `noticias/${id}`);
    return docData(noticiaDoc, { idField: 'idNoticias' }) as Observable<Noticias>;
  }


}
