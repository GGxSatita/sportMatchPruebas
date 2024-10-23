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
  IonCardHeader, IonCardSubtitle, IonAvatar } from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ClubesService } from 'src/app/services/clubes.service';
import { ActivatedRoute } from '@angular/router';
import { ClubChatComponent } from 'src/app/components/club-chat/club-chat.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Club } from 'src/app/models/club';
import { Observable } from 'rxjs';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router : Router

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
        this.isLeader = this.club.miembros.some(
          (miembro) =>
            miembro.userId === this.userId && miembro.role === 'lider'
        );
      } else {
        console.error('El club no se encontró o no tienes acceso.');
      }
    });
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
  goToEditarClub(clubId: string){
    this.router.navigate([`/club-edit/${clubId}`]);
  }


}
