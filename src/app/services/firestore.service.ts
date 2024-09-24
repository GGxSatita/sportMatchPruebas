import { inject, Injectable } from '@angular/core';
import { Firestore, serverTimestamp , doc, collection, setDoc} from '@angular/fire/firestore';

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
}
