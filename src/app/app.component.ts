import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniciconseService } from './services/ioniciconse.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private ioniciconseService : IoniciconseService = inject(IoniciconseService)

  constructor() {
    this.ioniciconseService.loadAllIcons();
  }
}
