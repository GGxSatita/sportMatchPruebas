import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, AlertController, IonItem, IonList, IonLabel, IonContent, IonAvatar, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';  // Importa solo una vez desde standalone
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonAvatar,
    IonLabel, IonList, IonItem, IonIcon, IonButton, IonButtons,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    HeaderComponent,FooterComponent
  ]
})
export class MenuPrincipalPage implements OnInit {

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  goToProfile() {
    this.router.navigate(['/user-perfil']);
  }
  goToSettings() {
    this.router.navigate(['/user-perfil']);
  }
  goToHelp(){
    this.router.navigate(['/user-perfil']);
  }

}
