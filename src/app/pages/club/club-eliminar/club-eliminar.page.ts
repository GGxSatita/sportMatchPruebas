import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-club-eliminar',
  templateUrl: './club-eliminar.page.html',
  styleUrls: ['./club-eliminar.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonCol, IonRow, IonGrid, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ClubEliminarPage implements OnInit {
  firstConfirmed = false;
  secondConfirmed = false;

  constructor(private alertController: AlertController) {}

  ngOnInit() {}

  confirmFirstStep() {
    this.firstConfirmed = true;
  }

  confirmSecondStep() {
    this.secondConfirmed = true;
  }

  async confirmFinalStep() {
    const alert = await this.alertController.create({
      header: 'Eliminar Club',
      message: '¿Estás absolutamente seguro de que deseas eliminar el club?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarClub();
          },
        },
      ],
    });
    await alert.present();
  }

  eliminarClub() {
    // Aquí se llamaría al servicio para eliminar el club y actualizar los perfiles de los usuarios
    console.log('Club eliminado');
  }
}
