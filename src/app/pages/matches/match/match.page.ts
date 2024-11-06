import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonButton,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../components/header/header.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonTitle,
    IonToolbar,
    IonButton,
    IonHeader,
    HeaderComponent,
    FooterComponent,
  ],
})
export class MatchPage {
  playerWins: number = 0;
  playerLosses: number = 0;

  constructor(private alertController: AlertController) {}

  async registerVictory() {
    this.playerWins++;
    await this.showAlert(
      '¡Victoria!',
      'Has registrado una victoria en el match.'
    );
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
