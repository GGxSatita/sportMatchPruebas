import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import Push from 'push.js';

@Component({
  selector: 'app-match-perfil',
  templateUrl: './match-perfil.page.html',
  styleUrls: ['./match-perfil.page.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, FooterComponent]
})
export class MatchPerfilPage implements OnInit {
  player: any;
  autentication: any;
  http: any;
  constructor(private route: ActivatedRoute, private autenticationService: AutenticacionService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.player = JSON.parse(params['player']);
    });
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            console.log('Permiso concedido');
          } else {
            console.log('Permiso denegado');
          }
        });
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Cambia a imagen por defecto si hay un error
  }

  sendNotification() {
    if ('Notification' in window) {
      const notification = new Notification('¡Has sido desafiado!', {
        body: 'Acepta o rechaza el desafío.',
        icon: '/assets/icon.png'
      });

      notification.onclick = event => {
        event.preventDefault(); // Previene que el navegador maneje el clic por defecto
        window.location.href = '/events'; // Redirige a la vista de eventos
      };

      notification.onclose = event => {
        console.log('Notificación cerrada');
      };
    }
  }


  challengePlayer() {
    this.sendNotification(); // Enviar notificación
    window.location.href = '/events'; // Redirigir a la vista de eventos
  }

}
