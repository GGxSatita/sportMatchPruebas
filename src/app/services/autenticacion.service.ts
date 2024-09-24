import { inject, Injectable } from '@angular/core';
import { Auth ,createUserWithEmailAndPassword,
   signInWithEmailAndPassword , authState, signOut, updateProfile} from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  //inyectar el servicio de autenticacion de firebase

  auth : Auth = inject(Auth)
  authState = authState(this.auth)

  constructor() {
    this.logout
   }

  async createUser (email: string, password: string){
    const user = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async login(email:string, password: string){
    const user = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  logout(){
    signOut(this.auth);
  }

  getCurrentUser() {
    return this.auth.currentUser
}

updateProfile(data: {displayName?: string, photoURL?: string}) {
  return updateProfile(this.auth.currentUser, data)
}



}
