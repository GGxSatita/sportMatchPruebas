import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as QRCode from 'qrcode-generator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonHeader } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-qr-creador',
  templateUrl: './qr-creador.page.html',
  styleUrls: ['./qr-creador.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IonHeader, HeaderComponent, FooterComponent],
})
export class QrCreadorPage implements OnInit, AfterViewInit {
  eventId: string = '';
  asistencia: { nombre: string; idAlumno: string; estado: boolean }[] = []; // Estado ahora es booleano

  constructor(
    private eventosService: EventosService,
    private reglasService: ReglasService,
    private route: ActivatedRoute,
    private router: Router
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
}
