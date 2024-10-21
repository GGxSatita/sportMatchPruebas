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
  currentUserId: string;
  searchTerm: string = '';
  selectedDeporte: string = '';
  deportes: string[] = []; // Lista para almacenar los deportes disponibles

  constructor(
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async ngOnInit() {
    const currentUser = await this.authService.getCurrentUser();
    this.currentUserId = currentUser?.uid || '';
    await this.checkIfUserIsInAClub();
    this.clubs = this.clubesService.getAllClubs();
    this.filteredClubs = this.clubs; // Inicialmente muestra todos los clubes
    await this.loadDeportes(); // Cargar los deportes disponibles
  }

  async checkIfUserIsInAClub() {
    if (this.currentUserId) {
      const userClub = await this.clubesService.getClubForUser(this.currentUserId);
      this.isMember = !!userClub;
      console.log('Usuario pertenece a un club:', this.isMember);
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
    if (!this.isMember && club.miembros.length < club.maxMiembros) {
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser?.uid;
      const userProfile = await this.authService.getUserProfile(userId);

      if (userId === club.adminId) {
        console.error('El creador del club no puede unirse nuevamente.');
        return;
      }

      if (userId && userProfile) {
        const newMember = {
          userId: userId,
          profile: userProfile,
          role: 'member' as const,
          fechaIngre: new Date(),
          puntos: 0,
        };

        const updatedMiembroIds = [...club.miembroIds, userId];
        const updatedMiembros = [...club.miembros, newMember];

        await this.clubesService.updateClub(club.idClub, {
          miembros: updatedMiembros,
          miembroIds: updatedMiembroIds,
        });
        this.isMember = true;
        console.log('Usuario añadido al club:', club.idClub);
      }
    } else {
      console.error('No puedes unirte a este club. Es posible que esté lleno o ya pertenezcas a otro club.');
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

  verClubDetalle(clubId: string) {
    this.router.navigate([`/club-detalle/${clubId}`]);
  }
}
