import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router, NavigationEnd } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from "@ionic/angular/standalone";
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MatchPerfilPage } from 'src/app/pages/match-perfil/match-perfil.page';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButtons, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle],
})
export class HeaderComponent implements OnInit {

  currentPage: string = ''; // Variable para almacenar la página actual
  pageTitle: string = ''; // Título personalizado de la página

  // Mapeo de rutas a nombres personalizados
  pageTitlesMap: { [key: string]: string } = {
    '/menu-principal': 'Menú Principal',
    '/user-perfil': 'Mi perfil',
    '/eventos': 'Eventos',
    '/chat': 'Chat',
    '/editar-perfil':'Editar perfil',
    '/cambiar-contrasena': 'Cambiar contraseña',
    '/settings': 'Configuraciones',
    '/recuperar-contrasena' : 'Recuperar contraseña',
    '/evento-list': 'Listado de eventos',
    '/evento-add': 'Agendar evento',
    '/evento-alumno': 'Eventos Alumno',
    '/match':'Match',
    '/match-perfil': "Datos del jugador",
    // Agrega las rutas y nombres que necesites
  };

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router,
    private alertController: AlertController,
    private location: Location // Inyectar el servicio Location para manejar el historial
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de navegación y obtener la URL actual
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPage = event.urlAfterRedirects; // Almacena la URL actual
      this.pageTitle = this.pageTitlesMap[this.currentPage] || 'Página Desconocida'; // Asigna el nombre de la página o un valor por defecto
    });
  }

  goBack() {
    this.location.back(); // Navegar a la página anterior en el historial
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
