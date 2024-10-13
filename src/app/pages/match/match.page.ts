import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonAvatar, IonLabel, IonCol, IonRow, IonGrid } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonLabel, IonAvatar, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, FooterComponent]
})
export class MatchPage implements OnInit {

  players: any[] = ['Users'];

  constructor(private autenticationService: AutenticacionService, private router: Router) { }

  async ngOnInit() {
    // this.fetchPlayers()
    this.players = await this.autenticationService.getLoggedInUsers();
  }

  goToPlayerDetails(player: any) {
    this.router.navigate(['/match-perfil'], {
      queryParams: { player: JSON.stringify(player) }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Cambia a imagen por defecto si hay un error
  }

}
