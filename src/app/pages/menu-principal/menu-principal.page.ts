
import {  inject,  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonItem, IonList, IonLabel, IonContent, IonAvatar, IonGrid, IonCol, IonRow, IonHeader, IonToolbar, IonButtons, IonTitle } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular'; // Importa solo IonicModule
import { AlertController } from '@ionic/angular';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { eventosAdmin } from 'src/app/models/evento-admin';


import { ClubesService } from 'src/app/services/clubes.service';


@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonList,
    IonLabel,
    IonContent,
    IonAvatar,
    IonGrid,
    IonCol,
    IonRow,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    HeaderComponent,
    FooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MenuPrincipalPage implements OnInit {

  eventos: eventosAdmin[] = [];
  alumnoId: string = '';


  constructor(
    private autenticacionService: AutenticacionService,
    private clubesService: ClubesService,
    private router: Router,
    private alertController: AlertController,
    private eventoAdminService: EventoAdminService,

  ) {}

  async ngOnInit() {
    try {
      const user = await this.autenticacionService.getCurrentUser();
      if (user) {
        this.alumnoId = user.uid;
      }

      this.eventoAdminService.getEventos().subscribe((eventos) => {
        this.eventos = eventos.filter(evento => evento.status === true);
      });
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
    }
  }


  async unirseAlEvento(eventoId: string) {
    try {
      // Obtén el evento específico para verificar su capacidad
      const evento = this.eventos.find(e => e.idEventosAdmin === eventoId);

      if (evento) {
        // Verifica si la cantidad de participantes ya ha alcanzado la capacidad máxima
        if (evento.participants.length >= evento.capacidadAlumnos) {
          console.log('Este evento ya ha alcanzado su capacidad máxima.');
          return;
        }

        // Si no ha alcanzado la capacidad, procede a unirse
        await this.eventoAdminService.joinEvento(eventoId, this.alumnoId);

        // Actualiza el evento localmente para reflejar los cambios
        evento.participants.push(this.alumnoId);

        console.log('Te has unido al evento.');
      } else {
        console.error('Evento no encontrado.');
      }
    } catch (error) {
      console.error('No se pudo unir al evento:', error);
    }
  }




  async goToClub() {
    const user = this.autenticacionService.getCurrentUser();

    if (user) {
        try {
            const club = await this.clubesService.getClubForUser(user.uid);
            console.log('Club obtenido en goToClub:', club); // Log para verificar el club
            if (club) {
                this.router.navigate([`/club/${club.idClub}`]);
            } else {
                const alert = await this.alertController.create({
                    header: 'No estás en un club',
                    message: 'Actualmente no perteneces a ningún club.',
                    buttons: ['OK'],
                });
                await alert.present();
            }
        } catch (error) {
            console.error('Error al obtener el club del usuario:', error);
        }
    } else {
        console.error('Usuario no autenticado');
    }
}







  goCrearClub() {
    this.router.navigate(['/crear-club']);
  }
  goToVerClubes() {
    this.router.navigate(['/club-list']);
  }

}
