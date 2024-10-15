import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniciconseService } from './services/ioniciconse.service';
import { AutenticacionService } from './services/autenticacion.service';
import { Router } from '@angular/router';
import Push from 'push.js';
import { notifications } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  //inyectar el servicio de autenticacion
  private autenticacionService: AutenticacionService = inject(AutenticacionService)

  private ioniciconseService: IoniciconseService = inject(IoniciconseService)


  constructor(private router: Router) {

    // this.registrarse()

    //usar los iconos cuando no tengo internet
    this.ioniciconseService.loadAllIcons();
  }
  ngOnInit() {

  }

}
