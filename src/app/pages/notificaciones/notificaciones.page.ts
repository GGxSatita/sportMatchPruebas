import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSegmentButton, IonButton, IonList, IonItem, IonCard, IonCardHeader, IonCardTitle, IonLabel, IonCardContent, IonSegment } from '@ionic/angular/standalone';
import { Notificacion, NotificacionTipo } from 'src/app/models/notificacion';
import { NotificationService } from 'src/app/services/notification.service';
import { Timestamp } from '@angular/fire/firestore';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [FooterComponent,HeaderComponent,IonSegment, IonCardContent, IonLabel, IonCardTitle, IonCardHeader, IonCard, IonItem, IonList, IonButton, IonSegmentButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NotificacionesPage implements OnInit {
  segmentoSeleccionado: string = 'noLeidas';
  notificacionesNoLeidas: Notificacion[] = [];
  notificacionesLeidas: Notificacion[] = [];
  userId: string;

  constructor(private notificacionesService: NotificationService) { }

  async ngOnInit() {
    const currentUser = await this.notificacionesService.authService.getCurrentUserAsync();
    if (currentUser) {
      this.userId = currentUser.uid;
      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones() {
    // Obtener notificaciones no leídas
    this.notificacionesService.getNotificacionesUsuario(false).subscribe((notificaciones: Notificacion[]) => {
      this.notificacionesNoLeidas = notificaciones.map(notificacion => ({
        ...notificacion,
        timestamp: notificacion.timestamp instanceof Timestamp ? notificacion.timestamp.toDate() : notificacion.timestamp
      }));
    });

    // Obtener notificaciones leídas
    this.notificacionesService.getNotificacionesUsuario(true).subscribe((notificaciones: Notificacion[]) => {
      this.notificacionesLeidas = notificaciones.map(notificacion => ({
        ...notificacion,
        timestamp: notificacion.timestamp instanceof Timestamp ? notificacion.timestamp.toDate() : notificacion.timestamp
      }));
    });
  }

  // Marcar una notificación específica como leída
  async marcarComoLeida(notificacionId: string) {
    if (this.userId) {
      await this.notificacionesService.marcarComoLeida(notificacionId, this.userId);
      this.cargarNotificaciones(); // Recargar notificaciones
    }
  }

  // Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas() {
    if (this.userId) {
      await this.notificacionesService.marcarTodasComoLeidas(this.userId);
      this.cargarNotificaciones(); // Recargar notificaciones
    }
  }
  convertirATimestampFecha(fecha: any): Date {
    return fecha instanceof Date ? fecha : (fecha as Timestamp).toDate();
  }
}
