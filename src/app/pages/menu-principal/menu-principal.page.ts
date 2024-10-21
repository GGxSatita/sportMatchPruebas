import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, AlertController, IonItem, IonList, IonLabel, IonContent, IonAvatar, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { ClubesService } from 'src/app/services/clubes.service';

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [
    IonRow, IonCol, IonGrid, IonAvatar, IonLabel, IonList, IonItem, IonIcon, IonButton, IonButtons,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    HeaderComponent, FooterComponent
  ]
})
export class MenuPrincipalPage implements OnInit {
  constructor(
    private autenticacionService: AutenticacionService,
    private clubesService: ClubesService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  goToProfile() {
    this.router.navigate(['/user-perfil']);
  }

  async goToClub() {
    const user = this.autenticacionService.getCurrentUser();

    if (user) {
        try {
            const club = await this.clubesService.getClubForUser(user.uid);
            console.log('Club obtenido en goToClub:', club); // Log para verificar el club
            if (club) {
                this.router.navigate([`/club/${club.idClub}`]);
            } else {
                const alert = await this.alertController.create({
                    header: 'No estás en un club',
                    message: 'Actualmente no perteneces a ningún club.',
                    buttons: ['OK'],
                });
                await alert.present();
            }
        } catch (error) {
            console.error('Error al obtener el club del usuario:', error);
        }
    } else {
        console.error('Usuario no autenticado');
    }
}







  goCrearClub() {
    this.router.navigate(['/crear-club']);
  }
  goToVerClubes() {
    this.router.navigate(['/club-list']);
  }
}
