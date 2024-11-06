import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as QRCode from 'qrcode-generator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-qr-creador',
  templateUrl: './qr-creador.page.html',
  styleUrls: ['./qr-creador.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class QrCreadorPage implements OnInit, AfterViewInit {
  eventId: string = 'example-event-id'; // Sujeto a cambio dinámico según tu aplicación

  constructor() {}

  ngOnInit() {
    // Aquí podrías obtener el `eventId` de un servicio o asignarlo dinámicamente
  }

  ngAfterViewInit() {
    this.generateQRCode();
  }

  generateQRCode() {
    try {
      const qrContainer = document.getElementById('qrcode');

      // Limpieza previa del contenedor
      if (qrContainer) {
        qrContainer.innerHTML = '';

        // Configuración y generación del QR
        const qr = QRCode(0, 'L');
        qr.addData(this.eventId);
        qr.make();

        // Renderizar el QR como imagen
        qrContainer.innerHTML = qr.createImgTag();
      } else {
        console.error('Elemento #qrcode no encontrado');
      }
    } catch (error) {
      console.error('Error generando el código QR:', error);
    }
  }
}
