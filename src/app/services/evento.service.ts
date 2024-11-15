import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collectionData,
  docData,
  getDocs,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';
import { eventos } from '../models/evento';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private collectionName = 'eventosAlumnos';
  private usersCollection = 'Users';


  constructor(private firestore: Firestore) {}


  getAlumnoNombre(idAlumno: string): Promise<string | null> {
    const alumnoDoc = doc(this.firestore, `Users/${idAlumno}`);
    return getDoc(alumnoDoc).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as any;
        const nombre = data.name;
        console.log("Nombre del alumno obtenido:", nombre);
        return nombre || null;
      }
      console.warn(`El documento para el alumno con ID ${idAlumno} no existe.`);
      return null;
    }).catch(error => {
      console.error("Error obteniendo el nombre del alumno:", error);
      return null;
    });
  }



  createEvento(evento: eventos): Promise<void> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return addDoc(eventosRef, { ...evento })
      .then((docRef) => {
        console.log('Evento creado con ID:', docRef.id);
        // Actualizar el evento con el ID generado
        return updateDoc(docRef, { idEventosAlumnos: docRef.id });
      })
      .catch((error) => {
        console.error('Error al crear evento:', error);
        throw error;
      });
  }

  getEventos(): Observable<any[]> {
    const eventosCollection = collection(this.firestore, this.collectionName);
    return from(getDocs(eventosCollection)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data()))
    );
  }

  getEvento(eventId: string): Promise<eventos | undefined> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${eventId}`);
    return getDoc(eventoDoc).then((snapshot) => {
      if (snapshot.exists()) {
        console.log('Evento encontrado:', snapshot.data());
        return snapshot.data() as eventos;
      } else {
        console.warn(`No se encontró el evento con ID ${eventId}`);
        return undefined;
      }
    });
  }

  getEventosConReglas(): Observable<eventos[]> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return from(getDocs(eventosRef)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data() as eventos;
          return { id: doc.id, ...data };
        });
      })
    );
  }


getParticipantesDeEvento(eventId: string): Observable<string[]> {
  const eventoDoc = doc(this.firestore, `${this.collectionName}/${eventId}`);
  return docData(eventoDoc).pipe(
    map((data) => {
      if (data && data['participantesActuales']) {
        return data['participantesActuales'];
      } else {
        console.warn(`El evento con ID ${eventId} no tiene participantes o no existe.`);
        return []; // Retorna un array vacío si no hay participantes o el documento no tiene esta propiedad
      }
    })
  );


}


  // Obtener participantes con estado
  getParticipantesConEstado(eventId: string): Promise<{ idAlumno: string, estado: boolean }[]> {
    return this.getEvento(eventId).then((evento) => {
      if (evento && evento.asistencia) {
        return evento.asistencia;
      } else {
        console.warn("No se encontró la asistencia para el evento:", eventId);
        return [];
      }
    });
  }

  getParticipantesConNombres(eventId: string): Promise<{ nombre: string, idAlumno: string, estado: boolean }[]> {
    return this.getEvento(eventId).then(async (evento) => {
      if (evento && evento.asistencia) {
        const observables = evento.asistencia.map(async (participante) => {
          const nombre = await this.getAlumnoNombre(participante.idAlumno);
          return {
            idAlumno: participante.idAlumno,
            nombre: nombre || participante.idAlumno, // Asigna el nombre si existe, de lo contrario el ID
            estado: participante.estado
          };
        });
        return Promise.all(observables);
      } else {
        console.warn("No se encontró la asistencia para el evento:", eventId);
        return [];
      }
    });
  }


  async actualizarEstadoParticipante(eventId: string, alumnoId: string): Promise<void> {
    const eventoDocRef = doc(this.firestore, `${this.collectionName}/${eventId}`);

    try {
      // Obtener el documento del evento
      const eventoSnap = await getDoc(eventoDocRef);

      if (!eventoSnap.exists()) {
        throw new Error('El evento no existe.');
      }

      const eventoData = eventoSnap.data() as eventos;

      // Asegurar que la lista de asistencia es un array
      let asistencia = eventoData.asistencia || [];

      // Buscar al alumno en la lista de asistencia y actualizar su estado
      const participante = asistencia.find((p) => p.idAlumno === alumnoId);

      if (participante) {
        participante.estado = true; // Cambia el estado del alumno a "true" (aceptado)
        console.log(`Estado del participante ${alumnoId} actualizado a aceptado.`);
      } else {
        throw new Error(`El alumno con ID ${alumnoId} no está en la lista de asistencia del evento.`);
      }

      // Actualizar el documento en Firestore con la lista de asistencia modificada
      await updateDoc(eventoDocRef, { asistencia: asistencia });

    } catch (error) {
      console.error("Error al actualizar el estado del participante:", error);
      throw error;
    }
  }






  updateEvento(id: string, evento: Partial<eventos>): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(eventoDoc, { ...evento });
  }


  deleteEvento(id: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(eventoDoc);
  }
}
