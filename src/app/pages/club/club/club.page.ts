import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonButton,
  IonLabel,
  IonItem,
  IonList,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonCardSubtitle,
  IonAvatar,
  AlertController
} from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ClubesService } from 'src/app/services/clubes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubChatComponent } from 'src/app/components/club-chat/club-chat.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Club } from 'src/app/models/club';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonCardSubtitle,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ClubChatComponent,
    HeaderComponent,
    FooterComponent
  ],
})
export class ClubPage implements OnInit {
  club: Club | undefined;
  isLeader: boolean = false;
  userId: string | null = null;
  isMember: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    const clubId = this.route.snapshot.paramMap.get('id');
    const user = await this.authService.getCurrentUser();

    if (user) {
      this.userId = user.uid;
      if (clubId) {
        this.cargarClub(clubId);
      }
    } else {
      console.error('Usuario no autenticado');
    }
  }

  cargarClub(clubId: string) {
    this.clubesService.getClubById(clubId).subscribe((club) => {
      if (club) {
        this.club = club;
        this.isMember = this.club.miembros.some(m => m.userId === this.userId);
        this.isLeader = this.club.miembros.some(
          (miembro) =>
            miembro.userId === this.userId && miembro.role === 'lider'
        );
      } else {
        console.error('El club no se encontró o no tienes acceso.');
      }
    });
  }

  async abandonarClub() {
    if (this.club && this.userId) {
      if (this.isLeader) {
        // El usuario es el líder, eliminar todos los miembros y el club
        await this.eliminarClubCompleto();
      } else {
        // El usuario no es el líder, solo eliminarlo a él del club
        try {
          await this.clubesService.eliminarMiembro(this.club.idClub, this.userId);
          this.isMember = false;
          console.log('Usuario ha abandonado el club');
          await this.showAlert('Club Abandonado', 'Has abandonado el club exitosamente.');
          this.router.navigate(['/club-list']);
        } catch (error) {
          console.error('Error al abandonar el club:', error);
          await this.showAlert('Error', 'Ocurrió un error al intentar abandonar el club.');
        }
      }
    }
  }

  async eliminarClubCompleto() {
    if (this.club) {
      try {
        // Eliminar todos los miembros y el club
        await this.clubesService.eliminarClub(this.club.idClub);
        console.log('El club ha sido eliminado completamente.');
        await this.showAlert('Club Eliminado', 'El club ha sido eliminado junto con todos sus miembros.');
        this.router.navigate(['/club-list']);
      } catch (error) {
        console.error('Error al eliminar el club:', error);
        await this.showAlert('Error', 'Ocurrió un error al intentar eliminar el club.');
      }
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

  eliminarMiembro(miembroId: string) {
    if (this.isLeader && this.club) {
      this.clubesService
        .eliminarMiembro(this.club.idClub, miembroId)
        .then(() => {
          console.log('Miembro eliminado');
          this.cargarClub(this.club!.idClub);
        });
    }
  }

  verMiembros(clubId: string) {
    this.router.navigate([`/club-miembros/${clubId}`]);
  }

  goToEditarClub(clubId: string) {
    this.router.navigate([`/club-edit/${clubId}`]);
  }
}
