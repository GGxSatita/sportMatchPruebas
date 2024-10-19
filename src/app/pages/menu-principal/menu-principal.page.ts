import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, AlertController, IonItem, IonList, IonLabel, IonContent, IonAvatar, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';  // Importa solo una vez desde standalone
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { eventos } from 'src/app/models/evento-admin';

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

  eventos: eventos[] = [];
  alumnoId: string = '';

  constructor(
    private autenticacionService: AutenticacionService,
    private eventoAdminService: EventoAdminService,
  ) {}

  async ngOnInit() {
    try {
      const user = await this.autenticacionService.getCurrentUser();
      if (user) {
        this.alumnoId = user.uid;
      }

      this.eventoAdminService.getEventos().subscribe((eventos) => {
        this.eventos = eventos;
      });
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
    }
  }


  async unirseAlEvento(eventoId: string) {
    try {
      await this.eventoAdminService.joinEvento(eventoId, this.alumnoId);
      console.log('Te has unido al evento.');
    } catch (error) {
      console.error('No se pudo unir al evento:', error);
    }
  }

}
