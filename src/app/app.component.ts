import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniciconseService } from './services/ioniciconse.service';
import { AutenticacionService } from './services/autenticacion.service';
import { Router } from '@angular/router';
import { NotificacionNativaService } from './services/notificacion-nativa.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
  ],
})
export class AppComponent implements OnInit {

  // Inyectar los servicios necesarios
  private autenticacionService: AutenticacionService = inject(AutenticacionService);
  private ioniciconseService: IoniciconseService = inject(IoniciconseService);

  constructor(
    private router: Router,
    private notificacionesNativas: NotificacionNativaService
  ) {
    // Cargar íconos cuando no hay conexión a internet
    this.ioniciconseService.loadAllIcons();
  }

  async ngOnInit() {
    // Verificar si la plataforma es nativa y el usuario está autenticado antes de inicializar notificaciones
    if (Capacitor.isNativePlatform()) {
      const user = await this.autenticacionService.getCurrentUserAsync();
      if (user) {
        // Inicializar el servicio de notificaciones
        this.notificacionesNativas.init();
      } else {
        console.log('Usuario no autenticado; no se registrará el token FCM');
      }
    }
  }
}
