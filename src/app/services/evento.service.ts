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
  providedIn: 'root',
})
export class EventosService {
  private collectionName = 'eventosAlumnos';
   private usersCollection = 'Users';

  constructor(private firestore: Firestore) { }


 // Obtener el nombre del alumno
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





  createEvento(evento: eventos): Promise<eventos> {
    const eventosRef = collection(this.firestore, this.collectionName);
    return addDoc(eventosRef, { ...evento })
      .then((docRef) => {
        const eventoConId: eventos = { ...evento, idEventosAlumnos: docRef.id };
        // Actualizar el documento con el ID generado
        return updateDoc(docRef, { idEventosAlumnos: docRef.id }).then(() => {
          console.log('Evento creado con ID:', docRef.id);
          return eventoConId; // Devolver el evento con el ID asignado
        });
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


  updateEvento(id: string, evento: Partial<eventos>): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(eventoDoc, { ...evento });
  }

  deleteEvento(id: string): Promise<void> {
    const eventoDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(eventoDoc);
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

 // Obtener participantes con nombres
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

actualizarEstadoParticipante(
  eventId: string,
  idAlumno: string,
  nuevoEstado: boolean
): Promise<void> {
  const eventoDocRef = doc(this.firestore, `${this.collectionName}/${eventId}`);

  return this.getEvento(eventId).then((evento) => {
    if (evento && evento.asistencia) {
      console.log("Array de asistencia antes de actualizar:", evento.asistencia);

      // Intentamos actualizar el estado solo si encontramos el idAlumno
      let cambioRealizado = false;
      const nuevaAsistencia = evento.asistencia.map((participante) => {
        if (participante.idAlumno === idAlumno) {
          cambioRealizado = true;
          return { ...participante, estado: nuevoEstado };
        }
        return participante;
      });

      if (!cambioRealizado) {
        console.warn("No se encontró el participante en el array de asistencia.");
        return Promise.reject("No se detectaron cambios en los datos de asistencia.");
      }

      console.log("Array de asistencia después de actualizar:", nuevaAsistencia);

      // Actualizar en Firestore solo si hubo un cambio
      return updateDoc(eventoDocRef, { asistencia: nuevaAsistencia })
        .then(() => {
          console.log(`Estado del participante ${idAlumno} actualizado a ${nuevoEstado ? 'aceptado' : 'pendiente'}`);
        })
        .catch((error) => {
          console.error("Error al actualizar en Firestore:", error);
          throw error;
        });
    } else {
      console.error("No se encontró el evento o el array de asistencia está vacío.");
      return Promise.reject("Evento o asistencia no encontrado.");
    }
  }).catch(error => {
    console.error("Error al actualizar el estado del participante:", error);
    throw error;
  });
}



}










