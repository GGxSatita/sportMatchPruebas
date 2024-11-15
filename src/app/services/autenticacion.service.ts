import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, authState, signOut,
  updateProfile, fetchSignInMethodsForEmail, EmailAuthProvider,
  updatePassword, reauthenticateWithCredential, sendPasswordResetEmail
} from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getMessaging, onMessage, getToken } from '@angular/fire/messaging';

import { Desafio, ParticipantModel } from '../models/desafio';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { ModelsAuth } from '../models/auth.models';
import { User } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { Reporte } from '../models/reportes';

import { Timestamp } from '@angular/fire/firestore';





@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  auth: Auth = inject(Auth);
  authState = authState(this.auth);
  router: Router = inject(Router);
  http: any;


  private reportesCollection = collection(this.firestore, 'Reportes');


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


   // Método de inicio de sesión
   async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verificar si el usuario tiene una sanción activa
      const sancionActiva = await this.obtenerSancionActiva(user.uid);
      if (sancionActiva) {
        throw new Error(
          `Tu cuenta está sancionada hasta ${new Date(
            sancionActiva.fechaExpiracionSancion
          ).toLocaleString()}. Motivo: ${sancionActiva.razon}`
        );
      }

      return userCredential;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  }




  async obtenerSancionActiva(usuarioId: string): Promise<Reporte | null> {
    const reportesRef = collection(this.firestore, 'Reportes');
    const q = query(
      reportesRef,
      where('reportadoId', '==', usuarioId),
      where('estado', '==', 'Cerrado')
    );

    const querySnapshot = await getDocs(q);
    const sanciones = querySnapshot.docs.map((doc) => {
      const reporte = doc.data() as Reporte;

      // Verificar si fechaExpiracionSancion es un Timestamp y convertirlo a Date si es necesario
      const fechaExpiracion = reporte.fechaExpiracionSancion instanceof Timestamp
        ? reporte.fechaExpiracionSancion.toDate()
        : reporte.fechaExpiracionSancion;

      return {
        ...reporte,
        fechaExpiracionSancion: fechaExpiracion,
      };
    });

    // Filtrar la sanción activa, asegurándonos de que fechaExpiracionSancion es una Date
    const sancionActiva = sanciones.find((reporte) =>
      reporte.fechaExpiracionSancion instanceof Date && reporte.fechaExpiracionSancion > new Date()
    );

    return sancionActiva || null;
  }




  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Correo electrónico inválido.';
      case 'auth/user-disabled':
        return 'Este usuario ha sido deshabilitado.';
      case 'auth/user-not-found':
        return 'No se encontró un usuario con este correo.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta. Por favor, intenta de nuevo.';
      default:
        return 'Error al iniciar sesión. Intenta de nuevo.';
    }
  }


  async createChallenge(userId: string, challengeData: any) {
    try {
      // Crear el desafío
      const currentUser = await this.auth.currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const newChallenge: Desafio = {
        id: '',
        type: challengeData.type,
        sport: challengeData.sport,
        status: 'PENDIENTE',
        participants: [
          {
            id: currentUser.uid,
            name: currentUser.displayName || 'Nombre del Jugador',
            score: 0
          } as ParticipantModel,
          {
            id: userId,
            name: 'Nombre del Retado', // Asumiendo que obtendrás el nombre del retado de alguna forma
            score: 0
          } as ParticipantModel
        ],
        rules: challengeData.rules,
        results: null
      };

      const desafioRef = await addDoc(collection(this.firestore, 'desafios'), newChallenge);
      await updateDoc(desafioRef, { id: desafioRef.id });

      console.log('Desafío creado con ID:', desafioRef.id);
    } catch (error) {
      console.error('Error creando desafío:', error);
    }
  }
  getDesafiosDelJugador(): Observable<any> {
    const currentUser = this.auth.currentUser;
    return this.http.get(`http://localhost:4200/api/desafios?userId=${currentUser?.uid}`);
  }

  aceptarDesafio(desafioId: string): Observable<any> {
    return this.http.post(`http://localhost:4200/api/aceptar-desafio`, { desafioId });
  }

  rechazarDesafio(desafioId: string): Observable<any> {
    return this.http.post(`http://localhost:4200/api/rechazar-desafio`, { desafioId });
  }

  async sendChallengeNotification(userId: string) {
    const payload = {
      userId: userId,
      title: '¡Has sido desafiado!',
      body: 'Acepta o rechaza el desafío.'
    };
    this.http.post('http://localhost:4200/api/send-notification', payload).subscribe((response: any) => {
      console.log('Notificación enviada:', response);
    }, (error: any) => {
      console.log('Error enviando notificación:', error);
    });

  }

  async getLoggedInUsersExcludingCurrentUser() {
    const currentUser = this.auth.currentUser;
    const usersCollection = collection(this.firestore, 'Users');
    const q = query(usersCollection, where('isLoggedIn', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map(doc => ({ ...doc.data(), uid: doc.id }))
      .filter(user => user.uid !== currentUser.uid);
  }

  async logout() {
    const user = this.auth.currentUser;
    if (user) {
      const userDocRef = doc(this.firestore, `Users/${user.uid}`);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Actualizar solo si el documento existe
        await updateDoc(userDocRef, {
          isLoggedIn: false
        });
      }
    }
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }


  getCurrentUser() {
    return this.auth.currentUser;
  }
  async getCurrentUserAsync(): Promise<User | null> {
    const user = await this.authState.pipe(take(1)).toPromise();
    return user;
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
  async getUserProfile(userId: string): Promise<ModelsAuth.UserProfile | null> {
    try {
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as ModelsAuth.UserProfile;
      } else {
        console.error('Perfil de usuario no encontrado.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      return null;
    }
  }

  getUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }


}