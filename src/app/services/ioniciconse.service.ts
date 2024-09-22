import { Injectable } from '@angular/core';
import { addIcons } from 'ionicons';
import * as all from 'ionicons/icons'

@Injectable({
  providedIn: 'root'
})
export class IoniciconseService {

  constructor() { }

  loadAllIcons(){
    addIcons(all);
  }

}
