import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { EventosService } from 'src/app/services/evento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';


@Component({
  selector: 'app-qr-usuario',
  templateUrl: './qr-usuario.page.html',
  styleUrls: ['./qr-usuario.page.scss'],
  standalone: true,
  imports: [    CommonModule,
    FormsModule,
    IonicModule,
    FooterComponent,
    HeaderComponent,]
})
export class QrUsuarioPage implements OnInit {

  totalParticipantes: number = 0;
  participantesPresentes: number = 0;
  html5QrcodeScanner!: Html5QrcodeScanner;
  eventId: string = '';


  constructor(
    private eventosService: EventosService,
    private route: ActivatedRoute,
     private authService: AutenticacionService,
     private router: Router
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || '';
    this.initializeParticipants();
  }

  ngAfterViewInit() {
    this.startQrScanner();
  }

  ngOnDestroy() {
    // Apaga y limpia el escáner cuando el componente se destruya
    if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner.clear().then(() => {
        console.log("Cámara apagada correctamente");
      }).catch((error) => {
        console.error("Error al apagar la cámara:", error);
      });
    }
  }

  initializeParticipants() {
    this.totalParticipantes = 20;
    this.participantesPresentes = 0;
  }

  startQrScanner() {
    this.html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );

    this.html5QrcodeScanner.render(
      this.onScanSuccess.bind(this),
      this.onScanFailure.bind(this)
    );
  }

   async onScanSuccess(qrCodeMessage: string) {
    const eventId = qrCodeMessage.trim(); // Este es el ID del evento obtenido del QR
    const alumnoId = this.authService.getUserId(); // Obtenemos el ID del alumno autenticado

    if (!alumnoId) {
      alert('Error: No se pudo obtener el ID del alumno autenticado.');
      return;
    }

    console.log("Código QR escaneado, ID del evento:", eventId);
    console.log("ID del alumno que está escaneando:", alumnoId);

    try {
      if (eventId && alumnoId) {
        await this.eventosService.actualizarEstadoParticipante(eventId, alumnoId);
        alert('Asistencia registrada exitosamente para el alumno!');
        this.participantesPresentes++;
      } else {
        alert('Error: Información incompleta.');
      }
    } catch (error) {
      console.error('Error al actualizar la asistencia del participante:', error);
      alert('Error al registrar la asistencia.');
    }
  }






  onScanFailure(error: any) {
    console.warn(`Error de escaneo: ${error}`);
  }
  irAEnfrentamiento() {
    this.router.navigate(['/enfrentamiento'], {
      queryParams: { eventId: this.eventId } // Pasar el ID del evento como parámetro
    });
  }

}
