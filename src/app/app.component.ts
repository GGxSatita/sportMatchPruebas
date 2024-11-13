import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniciconseService } from './services/ioniciconse.service';
import { AutenticacionService } from './services/autenticacion.service';
import { Router } from '@angular/router';
import Push from 'push.js';
import { notifications } from 'ionicons/icons';
import { HttpClientModule } from '@angular/common/http';
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

  //inyectar el servicio de autenticacion
  private autenticacionService: AutenticacionService = inject(AutenticacionService)

  private ioniciconseService: IoniciconseService = inject(IoniciconseService)



  constructor(private router: Router, private notificacionesNativas : NotificacionNativaService) {

    // this.registrarse()

    this.init()

    //usar los iconos cuando no tengo internet
    this.ioniciconseService.loadAllIcons();
  }
  ngOnInit() {

  }

  init(){
    if(Capacitor.isNativePlatform()){
      this.notificacionesNativas.init();
    }
  }
}
