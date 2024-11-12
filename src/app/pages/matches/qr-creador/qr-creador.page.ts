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
  asistencia: { nombre: string, idAlumno: string, estado: boolean }[] = []; // Estado ahora es booleano


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
    this.eventosService.getParticipantesConNombres(this.eventId)
      .then((asistencia) => {
        console.log("Asistencia obtenida con nombres:", asistencia);

        // Convert `estado` to boolean by casting it as a string first
        this.asistencia = asistencia.map(participante => ({
          ...participante,
          estado: (participante.estado as unknown as string) === 'aceptado'  // Convert 'aceptado' to true, otherwise false
        }));
      })
      .catch((error) => console.error('Error obteniendo asistencia:', error));
  }





  marcarComoAceptado(idAlumno: string) {
    this.eventosService.actualizarEstadoParticipante(this.eventId, idAlumno, true).then(() => {
      this.obtenerAsistencia(); // Recargar la lista después de actualizar el estado
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
    this.asistencia.forEach(participante => {
      if (!participante.estado) {  // Verifica si está en "pendiente" (estado === false)
        this.marcarComoAceptado(participante.idAlumno);
      }
    });
  }

}
