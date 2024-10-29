import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonGrid, IonRow, IonCol, IonAvatar, IonLabel, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, AlertController } from '@ionic/angular/standalone';
import { Club } from 'src/app/models/club';
import { ActivatedRoute } from '@angular/router';
import { ClubesService } from 'src/app/services/clubes.service';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

@Component({
  selector: 'app-club-detalle',
  templateUrl: './club-detalle.page.html',
  styleUrls: ['./club-detalle.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonButton, IonIcon, IonLabel, IonAvatar, IonCol, IonRow, IonGrid, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ClubDetallePage implements OnInit {
  club: Club | null = null;
  isMember: boolean = false;
  currentUserId: string | null = null;
  leaderName: string | null = null;
  userClubId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private alertController: AlertController // Inyectar AlertController para mostrar alertas
  ) {}

  async ngOnInit() {
    const clubId = this.route.snapshot.paramMap.get('id');
    if (clubId) {
      // Obtener los detalles del club
      await this.loadClubDetails(clubId);
    }

    const currentUser = await this.authService.getCurrentUser();
    this.currentUserId = currentUser?.uid || '';

    // Verificar si el usuario ya pertenece a un club
    await this.checkUserClubStatus();
  }

  async loadClubDetails(clubId: string) {
    try {
      const clubObservable = this.clubesService.getClubById(clubId);
      clubObservable.subscribe((club) => {
        if (club) {
          this.club = club;
          if (this.currentUserId) {
            this.isMember = this.club.miembros.some(m => m.userId === this.currentUserId);
            // Obtener el nombre del líder del club
            const leader = this.club.miembros.find(m => m.role === 'lider');
            this.leaderName = leader?.profile.name || 'Desconocido';
            console.log('Club cargado:', this.club);
          }
        } else {
          console.error('No se encontró el club.');
        }
      });
    } catch (error) {
      console.error('Error al cargar los detalles del club:', error);
    }
  }

  async checkUserClubStatus() {
    if (this.currentUserId) {
      const userClub = await this.clubesService.getClubForUser(this.currentUserId);
      this.userClubId = userClub ? userClub.idClub : null;
      this.isMember = !!userClub;
    }
  }

  async unirseAlClub() {
    if (this.club && !this.isMember && this.club.miembros.length < this.club.maxMiembros) {
      // Verificar si el usuario ya pertenece a otro club
      if (this.userClubId && this.userClubId !== this.club.idClub) {
        // Mostrar alerta si el usuario ya pertenece a otro club
        await this.showAlert('Acceso Denegado', 'Ya perteneces a un club y no puedes unirte a otro.');
        return;
      }

      try {
        const userProfile = await this.authService.getUserProfile(this.currentUserId);

        if (this.currentUserId && userProfile) {
          const newMember = {
            userId: this.currentUserId,
            profile: userProfile,
            role: 'member' as const,
            fechaIngre: new Date(),
            puntos: 0,
          };

          const updatedMiembroIds = [...this.club.miembroIds, this.currentUserId];
          const updatedMiembros = [...this.club.miembros, newMember];

          await this.clubesService.updateClub(this.club.idClub, { miembros: updatedMiembros, miembroIds: updatedMiembroIds });
          this.isMember = true;
        }
      } catch (error) {
        console.error('Error al unirse al club:', error);
      }
    } else {
      console.error('No puedes unirte a este club. Es posible que esté lleno o ya pertenezcas a otro club.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
