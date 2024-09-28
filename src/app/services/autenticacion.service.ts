import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, authState, signOut, updateProfile, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { Router } from '@angular/router'; // Importa el Router
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  // Inyectar el servicio de autenticación de Firebase
  auth: Auth = inject(Auth);
  authState = authState(this.auth);
  router : Router = inject(Router)

  constructor() {
    this.logout();
  }

  async createUser(email: string, password: string) {
    const user = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async login(email: string, password: string) {
    const user = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']); // Redirige al login después de cerrar sesión
    }).catch(error => {
      console.error('Error durante el logout:', error);
    });
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  updateProfile(data: { displayName?: string, photoURL?: string }) {
    return updateProfile(this.auth.currentUser, data);
  }

  // Nuevo método para verificar si un correo ya está registrado
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      return signInMethods.length > 0; // Si hay métodos de inicio de sesión, el correo está registrado
    } catch (error) {
      console.log('Error al verificar el correo electrónico:', error);
      return false; // Si ocurre un error, asumimos que el correo no está registrado
    }
  }
}
