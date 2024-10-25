import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonAvatar,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonCardContent,
  IonCol,
  IonIcon,
  IonRow,
  IonGrid,
  IonSelect,
  IonSelectOption,
  IonInput,
  AlertController
} from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';
import { Club } from 'src/app/models/club';
import { ClubesService } from 'src/app/services/clubes.service';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-club-list',
  templateUrl: './club-list.page.html',
  styleUrls: ['./club-list.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonIcon,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonLabel,
    IonList,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonAvatar,
    IonCardContent,
    CommonModule,
    FormsModule,
    IonInput,
  ],
})
export class ClubListPage implements OnInit {
  clubs: Observable<Club[]>;
  filteredClubs: Observable<Club[]>;
  isMember: boolean = false;
  isLeader: boolean = false;
  currentUserId: string;
  searchTerm: string = '';
  selectedDeporte: string = '';
  deportes: string[] = []; // Lista para almacenar los deportes disponibles

  constructor(
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router: Router,
    private alertController: AlertController // Inyectar AlertController para mostrar alertas
  ) {}

  async ngOnInit() {
    const currentUser = await this.authService.getCurrentUser();
    this.currentUserId = currentUser?.uid || '';
    await this.checkUserClubStatus();
    this.clubs = this.clubesService.getAllClubs();
    this.filteredClubs = this.clubs; // Inicialmente muestra todos los clubes
    await this.loadDeportes(); // Cargar los deportes disponibles
  }

  async checkUserClubStatus() {
    if (this.currentUserId) {
      const userClub = await this.clubesService.getClubForUser(this.currentUserId);
      if (userClub) {
        this.isMember = true;
        this.isLeader = userClub.miembros.some(m => m.userId === this.currentUserId && m.role === 'lider');
        console.log('Usuario pertenece a un club:', this.isMember);
        console.log('Usuario es líder de un club:', this.isLeader);
      } else {
        this.isMember = false;
        this.isLeader = false;
      }
    }
  }

  async loadDeportes() {
    try {
      this.deportes = await this.clubesService.getDeportes();
    } catch (error) {
      console.error('Error al cargar los deportes:', error);
    }
  }

  async unirseAlClub(club: Club) {
    // Verificar si el usuario ya pertenece a un club o es líder de otro club
    if (this.isMember || this.isLeader) {
      // Mostrar alerta y bloquear la acción
      await this.showAlert('Acceso Denegado', 'Ya perteneces a un club y no puedes unirte a otro.');
      return;
    }

    if (club.miembros.length < club.maxMiembros) {
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

          const updatedMiembroIds = [...club.miembroIds, this.currentUserId];
          const updatedMiembros = [...club.miembros, newMember];

          await this.clubesService.updateClub(club.idClub, {
            miembros: updatedMiembros,
            miembroIds: updatedMiembroIds,
          });
          this.isMember = true;
          console.log('Usuario añadido al club:', club.idClub);
        }
      } catch (error) {
        console.error('Error al unirse al club:', error);
      }
    } else {
      console.error('El club está lleno.');
    }
  }

  filterClubs() {
    this.filteredClubs = this.clubs.pipe(
      map((clubs) =>
        clubs.filter(
          (club) =>
            (this.searchTerm
              ? club.nombreClub.toLowerCase().includes(this.searchTerm.toLowerCase())
              : true) &&
            (this.selectedDeporte
              ? club.deporteNombre.includes(this.selectedDeporte)
              : true)
        )
      )
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  verClubDetalle(clubId: string) {
    this.router.navigate([`/club-detalle/${clubId}`]);
  }
}
