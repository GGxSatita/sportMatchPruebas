import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon , AlertController, IonItem, IonList, IonLabel } from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [IonLabel, IonList, IonItem, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MenuPrincipalPage implements OnInit {



  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router, // Inyectamos el Router correctamente aquí
    private alertController: AlertController // Inyectamos el AlertController aquí
  ) {}

  ngOnInit() {
  }

  goToProfile() {
    this.router.navigate(['/perfil']); // Redirige a la página de perfil del usuario
  }
  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.logout(); // Llama al método de logout si el usuario confirma
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    this.autenticacionService.logout();
    this.router.navigate(['/login']); // Redirige al login después de cerrar sesión
  }

}
