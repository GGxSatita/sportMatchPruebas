import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, authState, signOut,
  updateProfile, fetchSignInMethodsForEmail, EmailAuthProvider,
  updatePassword, reauthenticateWithCredential, sendPasswordResetEmail
} from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getMessaging, onMessage, getToken } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  auth: Auth = inject(Auth);
  authState = authState(this.auth);
  router: Router = inject(Router);

  constructor(private firestore: Firestore) { }

  async createUser(email: string, password: string) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.error('El correo electrónico ya está en uso.');
        throw new Error('auth/email-already-in-use');
      } else {
        console.error('Error al crear usuario:', error);
        throw error;
      }
    }
  }

  async login(email: string, password: string) {
    try {
      // Verificar que las credenciales no estén vacías
      if (!email || !password) {
        throw new Error('Las credenciales no pueden estar vacías.');
      }

      // Verificar el formato del correo
      if (!this.validateEmail(email)) {
        throw new Error('El formato del correo electrónico no es válido.');
      }

      // Intentar el login
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      const userID = user.user;
      if (user) {
        const userDoc = doc(this.firestore, `Users/${userID.uid}`);
        await updateDoc(userDoc, {
          lastLogin: new Date(),
          isLoggedIn: true,
          // messagingToken: await getToken(getMessaging())
        });
      }

      return user;
    } catch (error: any) {
      // Capturar los códigos de error específicos de Firebase
      if (error.code) {
        if (error.code === 'auth/invalid-email') {
          console.error('Correo electrónico inválido.');
          throw new Error('Correo electrónico inválido.');
        } else if (error.code === 'auth/user-disabled') {
          console.error('Usuario deshabilitado.');
          throw new Error('Este usuario ha sido deshabilitado.');
        } else if (error.code === 'auth/user-not-found') {
          console.error('Usuario no encontrado.');
          throw new Error('No se encontró un usuario con este correo.');
        } else if (error.code === 'auth/wrong-password') {
          console.error('Contraseña incorrecta.');
          throw new Error('Contraseña incorrecta. Por favor, intenta de nuevo.');
        } else if (error.code === 'auth/invalid-credential') {
          console.error('Credenciales inválidas.');
          throw new Error('Credenciales inválidas.');
        }
      }

      console.error('Error al iniciar sesión:', error);
      throw error;
    }

  }

  // async sendSimpleNotification(opponentId: string) {
  //   const opponentDoc = doc(this.firestore, `Users/${opponentId}`);
  //   const opponent = await getDoc(opponentDoc);
  //   if (opponent.exists()) {
  //     const opponentData = opponent.data();
  //     const payload = {
  //       notification: {
  //         title: '¡Has sido desafiado!',
  //         body: 'Tienes un nuevo desafío pendiente.'
  //       }
  //     };
  //     if (opponentData['messagingToken']) {
  //       await fetch('https://fcm.googleapis.com/fcm/send', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': 'key=YOUR_SERVER_KEY'
  //         },
  //         body: JSON.stringify({
  //           to: opponentData['messagingToken'],
  //           ...payload
  //         })
  //       });
  //     }
  //   }
  // }


  async getLoggedInUsers() {
    const currentUser = this.auth.currentUser;
    const usersCollection = collection(this.firestore, 'Users');
    const q = query(usersCollection, where('isLoggedIn', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map(doc => doc.data())
      .filter(user => user['uid'] !== currentUser?.uid);
  }

  async logout() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = doc(this.firestore, `Users/${user.uid}`);
      await updateDoc(userDoc, {
        isLoggedIn: false
      });
    }
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error durante el logout:', error);
    });
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Actualizar el perfil del usuario
  async updateProfile(data: { displayName?: string, photoURL?: string }) {
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, data);

      // Recargar el usuario después de la actualización
      await this.reloadUser();

      // Devolver el usuario actualizado
      return this.auth.currentUser;
    } else {
      throw new Error('No hay usuario autenticado para actualizar el perfil');
    }
  }

  async reloadUser() {
    if (this.auth.currentUser) {
      await this.auth.currentUser.reload(); // Recargar los datos del usuario
      return this.auth.currentUser; // Retornar el usuario actualizado
    }
    throw new Error('No se pudo recargar el usuario');
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.log('Error al verificar el correo electrónico:', error);
      return false;
    }
  }

  // Método para reautenticar al usuario con su contraseña actual
  async reauthenticate(currentPassword: string) {
    const user = this.auth.currentUser;
    if (!user?.email) {
      throw new Error('Usuario no autenticado.');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return await reauthenticateWithCredential(user, credential);
  }

  // Método para cambiar la contraseña
  async updatePassword(newPassword: string) {
    const user = this.auth.currentUser;
    if (user) {
      return await updatePassword(user, newPassword);
    } else {
      throw new Error('Usuario no autenticado.');
    }
  }

  // Validar formato de correo electrónico
  private validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

}
