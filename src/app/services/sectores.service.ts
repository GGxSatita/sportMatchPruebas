import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, updateDoc, collectionData, doc, DocumentReference } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Sectores } from '../models/sector';

@Injectable({
  providedIn: 'root'
})
export class SectoresService {
  private collectionName = 'sectores';

  constructor(private firestore: Firestore, private storage: Storage) {}

  addSector(sector: Sectores, file?: File): Promise<void> {
    const sectoresRef = collection(this.firestore, this.collectionName);

    return new Promise(async (resolve, reject) => {
      try {
        const docRef: DocumentReference = await addDoc(sectoresRef, { ...sector });

        if (file) {
          const filePath = `sectores/${docRef.id}/${file.name}`;
          const fileRef = ref(this.storage, filePath);
          const uploadTask = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(uploadTask.ref);

          // Corregir la referencia al documento
          const sectorDoc = doc(this.firestore, `${this.collectionName}/${docRef.id}`);
          await updateDoc(sectorDoc, { image: url });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteSector(idSector: string): Promise<void> {
    const sectorDoc = doc(this.firestore, `${this.collectionName}/${idSector}`);
    return deleteDoc(sectorDoc);
  }

  updateSector(idSector: string, sector: Sectores): Promise<void> {
    const sectorDoc = doc(this.firestore, `${this.collectionName}/${idSector}`);
    return updateDoc(sectorDoc, { ...sector });
  }

  getSectores(): Observable<Sectores[]> {
    const sectoresRef = collection(this.firestore, this.collectionName);
    return collectionData(sectoresRef, { idField: 'id' }) as Observable<Sectores[]>;
  }
}
