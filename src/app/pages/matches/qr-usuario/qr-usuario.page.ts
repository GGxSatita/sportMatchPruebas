// qr-usuario.page.ts

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { EventosService } from 'src/app/services/evento.service';
import { ActivatedRoute } from '@angular/router';

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
export class QrUsuarioPage implements OnInit, AfterViewInit, OnDestroy {
  totalParticipantes: number = 0;
  participantesPresentes: number = 0;
  html5QrcodeScanner!: Html5QrcodeScanner;
  eventId: string = '';

  constructor(
    private eventosService: EventosService,
    private route: ActivatedRoute
  ) {}

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
  console.log(`Código QR escaneado: ${qrCodeMessage}`);
  const alumnoId = qrCodeMessage.trim();

  try {
    console.log(`Intentando actualizar estado: Evento ID: ${this.eventId}, Alumno ID: ${alumnoId}`);
    if (this.eventId && alumnoId) {
      await this.eventosService.actualizarEstadoParticipante(this.eventId, alumnoId, true);  // `true` para aceptado
      alert('Participante registrado exitosamente!');
    } else {
      console.warn('Código QR no válido o falta el ID del evento.');
      alert('Este código QR no es válido.');
    }
  } catch (error) {
    console.error('Error al actualizar el estado del participante:', error);
    alert('Error al registrar la asistencia.');
  }
}



  onScanFailure(error: any) {
    console.warn(`Error de escaneo: ${error}`);
  }
}
