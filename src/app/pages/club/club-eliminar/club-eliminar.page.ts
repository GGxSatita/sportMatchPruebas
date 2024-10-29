import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonButton, AlertController } from '@ionic/angular/standalone';
import { ClubesService } from 'src/app/services/clubes.service'; // Importa el servicio
import { Router } from '@angular/router';

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
  clubId: string = 'ID_DEL_CLUB'; // Cambia esto según el contexto de la aplicación

  constructor(private alertController: AlertController, private clubesService: ClubesService, private router: Router) {}

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

  async eliminarClub() {
    try {
      await this.clubesService.eliminarClubYActualizarMiembros(this.clubId);

      console.log('Club eliminado y miembros actualizados');

      // Mostrar alerta de confirmación
      await this.showAlert('Club Eliminado', 'El club y todos los miembros han sido actualizados para reflejar la eliminación.');

      // Redirigir a la lista de clubes
      this.router.navigate(['/club-list']);
    } catch (error) {
      console.error('Error al eliminar el club:', error);
      await this.showAlert('Error', 'Ocurrió un error al intentar eliminar el club.');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
