import { inject, Injectable } from '@angular/core';
import { Auth ,createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  //inyectar el servicio de autenticacion de firebase

  auth : Auth = inject(Auth)

  constructor() { }

  async createUser (email: string, password: string){
    const user = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }
}
