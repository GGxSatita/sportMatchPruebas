import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

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
  constructor(private route: ActivatedRoute, private autenticationService: AutenticacionService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.player = JSON.parse(params['player']);
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Cambia a imagen por defecto si hay un error
  }

  challengePlayer() {
    // this.autenticationService.sendSimpleNotification(this.player.uid);
  }

}
