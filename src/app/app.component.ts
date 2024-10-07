import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniciconseService } from './services/ioniciconse.service';
import { AutenticacionService } from './services/autenticacion.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  //inyectar el servicio de autenticacion
  private autenticacionService : AutenticacionService = inject(AutenticacionService)

  private ioniciconseService : IoniciconseService = inject(IoniciconseService)

  constructor() {

    // this.registrarse()

    //usar los iconos cuando no tengo internet
    this.ioniciconseService.loadAllIcons();
  }


}
