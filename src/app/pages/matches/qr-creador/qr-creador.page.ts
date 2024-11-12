import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode-generator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonHeader } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { EventosService } from 'src/app/services/evento.service';

@Component({
  selector: 'app-qr-creador',
  templateUrl: './qr-creador.page.html',
  styleUrls: ['./qr-creador.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IonHeader, HeaderComponent, FooterComponent],
})
export class QrCreadorPage implements OnInit, AfterViewInit {
  eventId: string = '';
  asistencia: { nombre: string, idAlumno: string, estado: 'pendiente' | 'aceptado' }[] = []; // Incluye nombre

  constructor(
    private eventosService: EventosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || '';
    console.log("ID del evento:", this.eventId); // Verifica que el ID sea correcto
    this.obtenerAsistencia();
  }

  ngAfterViewInit() {
    this.generateQRCode();
  }

 obtenerAsistencia() {
    this.eventosService.getParticipantesConNombres(this.eventId).subscribe(
      (asistencia) => {
        console.log("Asistencia obtenida con nombres:", asistencia);
        this.asistencia = asistencia;
      },
      (error) => console.error('Error obteniendo asistencia:', error)
    );
  }
    marcarComoAceptado(idAlumno: string) {
    this.eventosService.actualizarEstadoParticipante(this.eventId, idAlumno, 'aceptado').then(() => {
      this.obtenerAsistencia(); // Recargar la lista
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
}
