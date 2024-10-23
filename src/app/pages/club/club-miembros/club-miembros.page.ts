import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonLabel, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonAvatar, IonList, IonButton } from '@ionic/angular/standalone';
import { Club } from 'src/app/models/club';
import { ClubesService } from 'src/app/services/clubes.service';
import { ActivatedRoute } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { getDoc } from '@angular/fire/firestore';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-club-miembros',
  templateUrl: './club-miembros.page.html',
  styleUrls: ['./club-miembros.page.scss'],
  standalone: true,
  imports: [HeaderComponent,IonButton, IonList, IonAvatar, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonLabel, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ClubMiembrosPage implements OnInit {

  club: Club | null = null;
  isLeader: boolean = false;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private alertController: AlertController,
    private notificacionesService: NotificacionesService,
    private router : Router
  ) { }

  async ngOnInit() {
    const clubId = this.route.snapshot.paramMap.get('id');
    const currentUser = await this.authService.getCurrentUser();

    if (currentUser) {
      this.currentUserId = currentUser.uid;
      if (clubId) {
        await this.cargarClub(clubId);
      }
    }
  }

  async cargarClub(clubId: string) {
    this.clubesService.getClubById(clubId).subscribe((club) => {
      this.club = club;
      if (this.club && this.currentUserId) {
        // Verificar si el usuario actual es el líder del club
        this.isLeader = this.club.miembros.some(
          miembro => miembro.userId === this.currentUserId && miembro.role === 'lider'
        );
      }
    });
  }

  async eliminarMiembro(miembroId: string) {
    if (this.isLeader && this.club) {
        console.log('ID del miembro a eliminar:', miembroId); // Log para verificar el ID

        try {
            // Eliminar al miembro del club
            await this.clubesService.eliminarMiembro(this.club.idClub, miembroId);
            console.log('Miembro eliminado correctamente');
            this.cargarClub(this.club.idClub); // Refrescar la lista de miembros

        } catch (error) {
            console.error('Error al eliminar el miembro:', error);
            const alert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo eliminar al miembro. Por favor, inténtalo de nuevo.',
                buttons: ['OK'],
            });
            await alert.present();
        }
    } else {
        console.error('No tienes permisos para eliminar miembros.');
    }
}



  async confirmarEliminacion(miembroId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar a este miembro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarMiembro(miembroId);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarAbandono() {
    const alert = await this.alertController.create({
      header: 'Confirmar Salida',
      message: '¿Estás seguro de que deseas abandonar el club?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Abandono cancelado');
          }
        },
        {
          text: 'Salir',
          handler: () => {
            this.abandonarClub();
          }
        }
      ]
    });

    await alert.present();
  }

  async abandonarClub() {
    if (this.club && this.currentUserId) {
      try {
        await this.clubesService.eliminarMiembro(this.club.idClub, this.currentUserId);
        console.log('Has abandonado el club');
        // Redirigir o actualizar la página según sea necesario
      } catch (error) {
        console.error('Error al abandonar el club:', error);
      }
    }
  }

}
