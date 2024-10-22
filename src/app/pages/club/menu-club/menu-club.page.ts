import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem, IonButton, IonCol, IonRow, IonGrid, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ClubesService } from 'src/app/services/clubes.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu-club',
  templateUrl: './menu-club.page.html',
  styleUrls: ['./menu-club.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, IonIcon, IonGrid, IonRow, IonCol, IonButton, HeaderComponent,FooterComponent,IonItem, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MenuClubPage implements OnInit {

  constructor(
    private autenticacionService: AutenticacionService,
    private clubesService : ClubesService,
    private router: Router,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
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

  goToCrearClub() {
    this.router.navigate(['/crear-club']);
  }
  goToVerClubes() {
    this.router.navigate(['/club-list']);
  }

}
