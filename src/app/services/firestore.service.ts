import { inject, Injectable } from '@angular/core';
import { Firestore, serverTimestamp , doc, collection, setDoc, updateDoc, docData} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore)

  constructor() { }

  async createDocument<tipo>(path:string, data :tipo , id :string = null){
    let refDoc;
    if(id){
      refDoc = doc(this.firestore, `${path}/${id}`);
    }else {
      const refCollection = collection(this.firestore, path)
      refDoc = doc(refCollection);
    }
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.data = serverTimestamp();
    await setDoc(refDoc, dataDoc);
    return dataDoc.id;

  }
  async updateDocument(path: string, data: any) {
    const refDoc = doc(this.firestore, path);
    data.updateAt = serverTimestamp();
    return await updateDoc(refDoc, data);
  }

  getDocumentChanges<tipo>(path: string) {
    const refDocument = doc(this.firestore, path);
    return docData(refDocument) as Observable<tipo> ;
  }
}
