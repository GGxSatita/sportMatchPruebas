import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, setDoc, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Reporte } from '../models/reportes';

@Injectable({
  providedIn: 'root'
})

export class ReportesService {

  private reportesCollection = collection(this.firestore, 'Reportes');

  constructor(private firestore: Firestore) {}

  // Crear un nuevo reporte
  crearReporte(reporte: Reporte): Promise<DocumentReference<DocumentData>> {
    return addDoc(this.reportesCollection, {
      ...reporte,
      fechaCreacion: new Date(),
      estado: 'Abierto'
    });
  }

   // Obtener el último reporte de sanción activo de un usuario
   obtenerSancionActiva(usuarioId: string): Observable<Reporte | null> {
    return collectionData(this.reportesCollection, { idField: 'id' }).pipe(
      map((reportes: any[]) =>
        reportes
          .filter(
            (reporte: Reporte) =>
              reporte.reportadoId === usuarioId &&
              reporte.estado === 'Cerrado' &&
              reporte.fechaExpiracionSancion &&
              new Date(reporte.fechaExpiracionSancion) > new Date()
          )
          .sort((a, b) => b.fechaExpiracionSancion!.getTime() - a.fechaExpiracionSancion!.getTime())
      ),
      map((reportes) => (reportes.length > 0 ? reportes[0] : null)) // Devuelve el último reporte de sanción activo
    );
  }

  // Obtener todos los reportes visibles para el usuario actual
  obtenerReportes(usuarioId: string): Observable<Reporte[]> {
    return collectionData(this.reportesCollection, { idField: 'id' }).pipe(
      map((reportes: DocumentData[]) =>
        reportes.filter(
          (reporte: any) => reporte.usuarioId === usuarioId && reporte.visibleUsuario
        ) as Reporte[]
      )
    );
  }

  // Obtener un reporte por ID
  obtenerReportePorId(reporteId: string): Observable<Reporte | undefined> {
    const reporteDoc = doc(this.firestore, `Reportes/${reporteId}`);
    return docData(reporteDoc, { idField: 'id' }) as Observable<Reporte | undefined>;
  }

  // Actualizar un reporte
  actualizarReporte(reporteId: string, cambios: Partial<Reporte>): Promise<void> {
    const reporteDoc = doc(this.firestore, `Reportes/${reporteId}`);
    return updateDoc(reporteDoc, {
      ...cambios,
      fechaActualizacion: new Date()
    });
  }

  // Eliminar un reporte (solo si el estado es "Cerrado" o si el admin lo permite)
  eliminarReporte(reporteId: string): Promise<void> {
    const reporteDoc = doc(this.firestore, `Reportes/${reporteId}`);
    return deleteDoc(reporteDoc);
  }

  // Obtener reportes por estado (ejemplo: todos los reportes "Abiertos" para el usuario)
  obtenerReportesPorEstado(usuarioId: string, estado: 'Abierto' | 'En progreso' | 'Cerrado'): Observable<Reporte[]> {
    return collectionData(this.reportesCollection, { idField: 'id' }).pipe(
      map((reportes: DocumentData[]) =>
        reportes.filter(
          (reporte: any) => reporte.usuarioId === usuarioId && reporte.estado === estado
        ) as Reporte[]
      )
    );
  }

  // Agregar respuesta del administrador a un reporte
  responderReporte(reporteId: string, respuesta: string): Promise<void> {
    const reporteDoc = doc(this.firestore, `Reportes/${reporteId}`);
    return updateDoc(reporteDoc, {
      respuesta: respuesta,
      estado: 'Cerrado', // Cambia el estado a "Cerrado" cuando el admin responde
      fechaActualizacion: new Date()
    });
  }
}
