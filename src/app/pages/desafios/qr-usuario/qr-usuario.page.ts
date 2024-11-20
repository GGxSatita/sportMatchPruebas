import { Component, OnInit, OnDestroy } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { EventosService } from 'src/app/services/evento.service';
import { ActivatedRoute } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

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

  constructor(
    private eventosService: EventosService,
    private route: ActivatedRoute,
    private authService: AutenticacionService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || '';
    this.initializeParticipants();
    this.obtenerAsistencia();
  }

  ngOnDestroy() {
    if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner
        .clear()
        .then(() => {
          console.log('Cámara apagada correctamente');
        })
        .catch((error) => {
          console.error('Error al apagar la cámara:', error);
        });
    }
  }

  initializeParticipants() {
    this.totalParticipantes = 20;
    this.participantesPresentes = 0;
  }

  toggleQrScanner() {
    this.qrScannerVisible = !this.qrScannerVisible;

    if (this.qrScannerVisible) {
      setTimeout(() => {
        this.startQrScanner();
      }, 0);
    } else if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner
        .clear()
        .then(() => {
          console.log('Cámara apagada correctamente');
        })
        .catch((error) => {
          console.error('Error al apagar la cámara:', error);
        });
    }
  }

  startQrScanner() {
    const qrReaderElement = document.getElementById('qr-reader');
    if (!qrReaderElement) {
      console.error('No se encontró el elemento del lector QR.');
      return;
    }

    qrReaderElement.style.display = 'block';

    if (!this.html5QrcodeScanner) {
      this.html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: 250 },
        false
      );
    }

    this.html5QrcodeScanner.render(
      this.onScanSuccess.bind(this),
      this.onScanFailure.bind(this)
    );
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
    this.reporteForm.reportadoId = participante.idAlumno; // Configura el ID del participante a reportar
  }

  cerrarFormularioReporte() {
    this.modalAbierto = false;
    this.reporteForm = { razon: '', reportadoId: '', detallesAdicionales: '' }; // Reinicia el formulario
  }

  enviarReporte() {
    const reporte = {
      ...this.reporteForm,
      usuarioId: this.authService.getUserId(),
      fechaCreacion: new Date(),
      estado: 'Abierto',
      visibleUsuario: true,
    };

    // Aquí puedes usar un servicio para guardar el reporte en tu backend
    console.log('Reporte enviado:', reporte);

    this.cerrarFormularioReporte(); // Cierra el modal
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


}
