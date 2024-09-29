import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router, NavigationEnd } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from "@ionic/angular/standalone";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonTitle, IonToolbar, IonHeader, CommonModule, IonButtons, IonButton, IonIcon],
})
export class HeaderComponent implements OnInit {

  currentPage: string = ''; // Variable para almacenar la página actual

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de navegación y obtener la URL actual
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPage = event.urlAfterRedirects; // Almacena la URL actual
    });
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
