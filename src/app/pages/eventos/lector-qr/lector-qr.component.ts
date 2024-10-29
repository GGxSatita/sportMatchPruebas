import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { Auth } from '@angular/fire/auth';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-lector-qr',
  templateUrl: './lector-qr.page.html', // Revisa que esta ruta sea correcta
  styleUrls: ['./lector-qr.page.scss']
})

export class LectorQrPage implements OnInit, OnDestroy {
  eventoId: string | null = null;
  html5QrCode: Html5Qrcode | null = null;
  scanResult: string | null = null;
  isInscrito: boolean | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventoAdminService: EventoAdminService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventoId = params['eventoId'];
    });

    // Inicializar el lector QR
    this.html5QrCode = new Html5Qrcode("reader");

    // Comienza el escaneo
    this.html5QrCode.start(
      { facingMode: "environment" },  // Cámara trasera
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => this.onScanSuccess(decodedText),
      (errorMessage) => {
        console.warn("Error al escanear el QR:", errorMessage);
      }
    ).catch(err => console.error("Error al iniciar la cámara:", err));
  }

  ngOnDestroy(): void {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        console.log("Escáner detenido.");
      }).catch(err => console.error("Error al detener el escáner:", err));
    }
  }

  async onScanSuccess(decodedText: string) {
    try {
      const data = JSON.parse(decodedText);
      const scannedEventoId = data.eventoId;

      if (this.eventoId && this.eventoId === scannedEventoId) {
        const user = this.auth.currentUser;
        if (user) {
          const alumnoId = user.uid;
          const evento = await this.eventoAdminService.getEventoSnapshot(this.eventoId);
          if (evento && evento.participants.includes(alumnoId)) {
            this.isInscrito = true;
            this.scanResult = `Estás inscrito en el evento "${evento.titulo}".`;
          } else {
            this.isInscrito = false;
            this.scanResult = "No estás inscrito en este evento.";
          }
        } else {
          this.scanResult = "Usuario no autenticado.";
        }
      } else {
        this.scanResult = "El QR no corresponde a este evento.";
      }
    } catch (error) {
      console.error('Error al procesar el QR:', error);
      this.scanResult = "Error al procesar el QR.";
      this.isInscrito = null;
    }
  }
}
