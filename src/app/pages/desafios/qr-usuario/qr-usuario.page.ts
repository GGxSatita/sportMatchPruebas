import { Component, OnInit, OnDestroy } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { EventosService } from 'src/app/services/evento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { Reporte } from 'src/app/models/reportes';

@Component({
  selector: 'app-qr-usuario',
  templateUrl: './qr-usuario.page.html',
  styleUrls: ['./qr-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooterComponent,
    HeaderComponent,
  ],
})
export class QrUsuarioPage implements OnInit, OnDestroy {
  totalParticipantes: number = 0;
  participantesPresentes: number = 0;
  asistencia: { nombre: string; idAlumno: string; estado: boolean }[] = [];
  html5QrcodeScanner!: Html5QrcodeScanner;
  eventId: string = '';

  qrScannerVisible: boolean = false;
  modalAbierto: boolean = false; // Controla la visibilidad del modal de reportes
  modalParticipantesAbierto: boolean = false; // Controla la visibilidad del modal de la lista de jugadores
  reporteForm: {
    razon: string;
    detallesAdicionales?: string;
    reportadoId: string;
  } = {
    razon: '',
    reportadoId: '',
    detallesAdicionales: '',
  };

  private codeReader: BrowserMultiFormatReader | null = null; // Instancia del lector de ZXing
  private videoElement: HTMLVideoElement | null = null;

  constructor(
    private eventosService: EventosService,
    private reglasService: ReglasService,
    private route: ActivatedRoute,
    private authService: AutenticacionService,
    private router: Router,
    private reportesService: ReportesService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || '';
    this.initializeParticipants();
    this.obtenerAsistencia();
  }


  ngOnDestroy() {
    if (this.codeReader) {
      this.codeReader.reset();
    }
  }



  initializeScanner() {
    // Asegúrate de que el elemento #qr-reader exista
    const qrReaderElement = document.getElementById('qr-reader');
    if (qrReaderElement && !this.codeReader) {
      this.videoElement = document.createElement('video');
      qrReaderElement.appendChild(this.videoElement);

      // Inicializa BrowserMultiFormatReader
      this.codeReader = new BrowserMultiFormatReader();

      // Comienza el escaneo desde la cámara por defecto
      this.startQrScanner();
    } else {
      console.error('No se encontró el elemento del lector QR o el lector ya está inicializado.');
    }
  }

  initializeParticipants() {
    this.totalParticipantes = 20;
    this.participantesPresentes = 0;
  }

  toggleQrScanner() {
    this.qrScannerVisible = !this.qrScannerVisible;

    // Si el escáner se va a mostrar
    if (this.qrScannerVisible) {
      // Esperamos un pequeño retraso para que los elementos DOM estén listos
      setTimeout(() => {
        this.initializeScanner();
      }, 100); // Ajusta el retraso si es necesario
    } else {
      // Apagar el lector QR cuando el escáner no es visible
      if (this.codeReader) {
        this.codeReader.reset();
        console.log('Escáner QR detenido.');
      }
    }
  }



  startQrScanner() {
    if (!this.codeReader || !this.videoElement) return;

    this.codeReader
      .decodeFromVideoDevice(
        null, // Si no deseas una cámara específica, pasa null
        this.videoElement,
        (result, error) => {
          if (result) {
            this.onScanSuccess(result.getText());
          }
          if (error) {
            this.onScanFailure(error);
          }
        }
      )
      .then(() => {
        console.log('Escaneo iniciado');
      })
      .catch((err) => {
        console.error('Error al iniciar el escaneo:', err);
      });
  }

  async onScanSuccess(qrCodeMessage: string) {
    const eventId = qrCodeMessage.trim();
    const alumnoId = this.authService.getUserId();

    if (!alumnoId) {
      alert('Error: No se pudo obtener el ID del alumno autenticado.');
      return;
    }

    try {
      if (eventId && alumnoId) {
        await this.eventosService.actualizarEstadoParticipante(eventId, alumnoId);
        alert('Asistencia registrada exitosamente para el alumno!');
        this.obtenerAsistencia(); // Recargar la lista después de registrar la asistencia
      } else {
        alert('Error: Información incompleta.');
      }
    } catch (error) {
      console.error('Error al actualizar la asistencia del participante:', error);
      alert('Error al registrar la asistencia.');
    }
  }

  obtenerAsistencia() {
    this.eventosService
      .getParticipantesConNombres(this.eventId)
      .then((asistencia) => {
        this.asistencia = asistencia.map((participante) => ({
          ...participante,
          estado: Boolean(participante.estado), // Asegura que el estado sea booleano
        }));
      })
      .catch((error) =>
        console.error('Error obteniendo la lista de asistencia:', error)
      );
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







  onScanFailure(error: any) {
    console.warn(`Error de escaneo: ${error}`);
  }

  abrirListaJugadores() {
    this.modalParticipantesAbierto = true; // Abre el modal de lista de jugadores
    console.log('Lista de jugadores abierta');
  }

  cerrarListaJugadores() {
    this.modalParticipantesAbierto = false; // Cierra el modal de lista de jugadores
    console.log('Lista de jugadores cerrada');
  }

  abrirChat() {
    console.log('Abrir Chat');
    // Aquí puedes redirigir o abrir la funcionalidad de chat
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
}
