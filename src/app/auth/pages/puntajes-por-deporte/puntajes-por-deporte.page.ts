import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem, IonList, IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../../components/header/header.component";
import { FooterComponent } from "../../../components/footer/footer.component";

import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ScoreModel } from 'src/app/models/desafio';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-puntajes-por-deporte',
  templateUrl: './puntajes-por-deporte.page.html',
  styleUrls: ['./puntajes-por-deporte.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, FooterComponent]
})
export class PuntajesPorDeportePage implements OnInit {
  deportes: { nombre: string; score: number; rank: string }[] = [];
  userScore: ScoreModel | null = null;

  firestoreService = inject(FirestoreService);
  autenticacionService = inject(AutenticacionService);

  constructor() {}

  async ngOnInit() {
    try {
      const currentUser = await this.autenticacionService.getCurrentUserAsync();
      if (!currentUser) {
        console.warn('No se encontró al usuario actual.');
        return;
      }

      const userId = currentUser.uid;
      const scorePath = `scores/${userId}`;
      this.userScore = await this.firestoreService.getDocument<ScoreModel>(scorePath);

      if (this.userScore && this.userScore.deportes) {
        this.deportes = Object.keys(this.userScore.deportes).map((key) => ({
          nombre: key.trim(),
          score: this.userScore.deportes[key].score,
          rank: this.userScore.deportes[key].rank
        }));
      } else {
        console.warn('No se encontró el puntaje del usuario en la base de datos.');
      }
    } catch (error) {
      console.error('Error al obtener los puntajes por deportes:', error);
    }
  }
}
