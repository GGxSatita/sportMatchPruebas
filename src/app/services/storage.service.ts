import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = getStorage();
  constructor() {}

// Método para subir un archivo a Firebase Storage
uploadFile(filePath: string, file: File): Observable<string> {
  return new Observable<string>(observer => {
    const storageRef = ref(this.storage, filePath); // Creamos la referencia al archivo
    const uploadTask = uploadBytesResumable(storageRef, file); // Iniciamos la subida del archivo

    uploadTask.on(
      'state_changed',
      () => {
        // Puedes manejar el progreso de la subida aquí si lo necesitas
      },
      (error) => {
        // Manejamos errores
        observer.error(error);
      },
      () => {
        // Cuando la subida se completa obtenemos la URL de descarga
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          observer.next(downloadURL);
          observer.complete();
        });
      }
    );
  });
}
}
