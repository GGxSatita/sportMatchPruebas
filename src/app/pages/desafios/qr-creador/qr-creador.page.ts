import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as QRCode from 'qrcode-generator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { EventosService } from 'src/app/services/evento.service';
import { ReglasService } from 'src/app/services/reglas.service';
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonContent,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';
import { ReportesService } from 'src/app/services/reportes.service'; // Importar el servicio de reportes
import { Reporte } from 'src/app/models/reportes';
import { AutenticacionService } from 'src/app/services/autenticacion.service';


@Component({
  selector: 'app-qr-creador',
  templateUrl: './qr-creador.page.html',
  styleUrls: ['./qr-creador.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HeaderComponent, FooterComponent],
})
export class QrCreadorPage implements OnInit, AfterViewInit {
  eventId: string = '';
  asistencia: { nombre: string; idAlumno: string; estado: boolean }[] = []; // Estado ahora es booleano
  reporteForm: {
    razon: string;
    detallesAdicionales?: string;
    reportadoId: string;
  } = {
    razon: '',
    reportadoId: '',
    detallesAdicionales: '',
  };

  modalAbierto: boolean = false; // Controla la visibilidad del modal de reportes
  modalParticipantesAbierto: boolean = false;
  constructor(
    private eventosService: EventosService,
    private reglasService: ReglasService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AutenticacionService,
    private reportesService: ReportesService

  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || '';
    console.log('ID del evento:', this.eventId); // Verifica que el ID sea correcto
    this.obtenerAsistencia();
  }

  ngAfterViewInit() {
    this.generateQRCode();
  }

  obtenerAsistencia() {
    this.eventosService
      .getParticipantesConNombres(this.eventId)
      .then((asistencia) => {
        console.log('Asistencia obtenida con nombres:', asistencia);

        // Aquí nos aseguramos de que `estado` sea booleano
        this.asistencia = asistencia.map((participante) => ({
          ...participante,
          estado: Boolean(participante.estado), // Asegura que `estado` sea booleano
        }));
      })
      .catch((error) => console.error('Error obteniendo asistencia:', error));
  }

  marcarComoAceptado(idAlumno: string) {
    this.eventosService
      .actualizarEstadoParticipante(this.eventId, idAlumno)
      .then(() => {
        this.obtenerAsistencia(); // Recargar la lista después de actualizar el estado
      })
      .catch((error) => {
        console.error('Error al actualizar el estado del participante:', error);
      });
  }

  generateQRCode() {
    try {
      const qrContainer = document.getElementById('qrcode');
      if (qrContainer) {
        qrContainer.innerHTML = '';
        const qr = QRCode(0, 'L');
        qr.addData(this.eventId);
        qr.make();
        qrContainer.innerHTML = qr.createImgTag();
      } else {
        console.error('Elemento #qrcode no encontrado');
      }
    } catch (error) {
      console.error('Error generando el código QR:', error);
    }
  }

  simulateQRCodeScan() {
    this.asistencia.forEach((participante) => {
      if (!participante.estado) {
        // Verifica si está en "pendiente" (estado === false)
        this.marcarComoAceptado(participante.idAlumno);
      }
    });
  }



  async irAEnfrentamiento() {
    try {
      const reglas = await this.reglasService.getReglasByEventId(this.eventId);

      if (reglas?.esPorEquipos) {
        this.router.navigate(['/enfrentamiento-equipos'], {
          queryParams: { eventId: this.eventId },
        });
      } else {
        this.router.navigate(['/enfrentamiento'], {
          queryParams: { eventId: this.eventId },
        });
      }
    } catch (error) {
      console.error('Error al verificar las reglas del evento:', error);
    }
  }





  abrirFormularioReporte(participante: { idAlumno: string; nombre: string }) {
    this.modalAbierto = true;
    this.reporteForm.reportadoId = participante.idAlumno; // Asegura que se asigne correctamente el ID de quien se reporta
  }

  cerrarFormularioReporte() {
    this.modalAbierto = false;
    this.reporteForm = { razon: '', reportadoId: '', detallesAdicionales: '' }; // Reinicia el formulario
  }

  async enviarReporte() {
    const usuarioId = this.authService.getUserId(); // Este es el ID del usuario que hace el reporte

    if (!usuarioId) {
      alert('Error: No se pudo obtener el ID del usuario autenticado.');
      return;
    }

    const razonValida = ['Retraso', 'Mala competitividad', 'Tóxico', 'Otro'].includes(this.reporteForm.razon)
      ? this.reporteForm.razon
      : 'Otro';

    const reporte: Reporte = {
      usuarioId: usuarioId,  // Aquí asignas correctamente el usuario que hace el reporte
      reportadoId: this.reporteForm.reportadoId,  // Asegúrate de que este sea el ID de quien está siendo reportado
      tipoReporte: razonValida,
      razon: razonValida as 'Retraso' | 'Mala competitividad' | 'Tóxico' | 'Otro',
      mensaje: this.reporteForm.detallesAdicionales || 'No se proporcionó un mensaje adicional',
      estado: 'Abierto',
      fechaCreacion: new Date(),
      visibleUsuario: true,
      detallesAdicionales: this.reporteForm.detallesAdicionales || undefined,
    };

    try {
      await this.reportesService.crearReporte(reporte);
      alert('Reporte enviado exitosamente.');
      this.cerrarFormularioReporte();
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  }

}
