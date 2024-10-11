import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Sectores } from '../models/sector';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SectoresService {

  private collectionName = 'sectores';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  addSector(sector: Sectores, file?: File): Promise<any> {
    const id = this.firestore.createId();
    sector.idSector = id;

    if (file) {
      const filePath = `sectores/${id}/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      return new Promise((resolve, reject) => {
        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              sector.image = url;
              this.firestore.collection(this.collectionName).doc(id).set({ ...sector })
                .then(() => resolve(null))
                .catch(err => reject(err));
            }, err => reject(err));
          })
        ).subscribe();
      });
    } else {
      return this.firestore.collection(this.collectionName).doc(id).set({ ...sector });
    }
  }

  deleteSector(idSector: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(idSector).delete();
  }

  updateSector(idSector: string, sector: Sectores): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(idSector).update({ ...sector });
  }

  getSectores(): Observable<Sectores[]> {
    return this.firestore.collection<Sectores>(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Sectores;
        const id = a.payload.doc.id;
        return { ...data, idSector: id };
      }))
    );
  }


}
