import { inject, Injectable } from '@angular/core';
import { Firestore, serverTimestamp , doc, collection, setDoc, updateDoc, docData} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  // Inyecta Firestore para interactuar con la base de datos
  private firestore: Firestore = inject(Firestore)

  constructor() { }

  /**
   * Crea un documento en Firestore.
   *path Ruta de la colección donde se guardará el documento.
   * data Datos que se almacenarán en el documento.
   *  id (Opcional) ID del documento. Si no se proporciona, se genera automáticamente.
   *  El ID del documento creado.
   */
  async createDocument<tipo>(path:string, data :tipo , id :string = null){
    let refDoc;
    if(id){
      // Crea un documento con ID específico
      refDoc = doc(this.firestore, `${path}/${id}`);
    }else {
      // Genera un nuevo ID para el documento
      const refCollection = collection(this.firestore, path)
      refDoc = doc(refCollection);
    }
    // Agrega timestamp y guarda el documento
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.data = serverTimestamp();
    await setDoc(refDoc, dataDoc);
    return dataDoc.id;
  }

  /**
   * Actualiza un documento existente en Firestore.
   *  path Ruta completa del documento (incluyendo el ID).
   *  data Datos actualizados para el documento.
   *  Promesa que se resuelve cuando la actualización es exitosa.
   */
  async updateDocument(path: string, data: any) {
    // Referencia al documento
    const refDoc = doc(this.firestore, path);
    // Agrega timestamp de actualización
    data.updateAt = serverTimestamp();
    return await updateDoc(refDoc, data);
  }

  /**
   * Obtiene los datos de un documento y escucha los cambios en tiempo real.
   *  path Ruta completa del documento (incluyendo el ID).
   *  Observable que emite cambios en los datos del documento.
   */
  getDocumentChanges<tipo>(path: string): Observable<tipo> {
    // Referencia al documento y suscripción a los cambios
    const refDocument = doc(this.firestore, path);
    return docData(refDocument) as Observable<tipo>;
  }
}
