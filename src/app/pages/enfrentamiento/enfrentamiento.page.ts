import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel } from 'src/app/models/desafio';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { interval, Subscription } from 'rxjs';
import { IonList, IonContent, IonItem, IonAvatar, IonIcon, IonLabel, IonButton } from "@ionic/angular/standalone";
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from "../../components/header/header.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enfrentamiento',
  templateUrl: './enfrentamiento.page.html',
  styleUrls: ['./enfrentamiento.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonLabel, IonIcon, IonAvatar, IonItem, IonContent, IonList, FooterComponent, HeaderComponent]
})
export class EnfrentamientoPage implements OnInit, OnDestroy {
  participantes: ParticipantModel[] = [];
  currentUserId: string = '';
  maxPoints: number = 0;
  ganador: string | null = null;
  autoRefreshSubscription!: Subscription;
  currentParticipante: ParticipantModel | null = null;
  animatingParticipantId: string | null = null; // ID del participante que está siendo animado

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private reglasService: ReglasService,
    private authService: AutenticacionService
  ) {}

  async ngOnInit() {
    this.currentUserId = this.authService.getUserId() || '';

    if (!this.currentUserId) {
      console.error('Error: Usuario no autenticado');
      return;
    }

    const eventId = this.route.snapshot.queryParamMap.get('eventId');
    if (!eventId) {
      console.error('Error: No se proporcionó eventId');
      return;
    }

    // Cargar reglas del evento
    await this.loadReglas(eventId);

    // Registrar al usuario actual
    await this.registrarParticipante(this.currentUserId);

    // Configurar auto-refresh
    this.autoRefreshSubscription = interval(10000).subscribe(() => {
      this.refreshParticipantes();
    });

    this.refreshParticipantes();
  }

  ngOnDestroy() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  private async loadReglas(eventId: string) {
    try {
      const reglas = await this.reglasService.getReglasByEventId(eventId);
      this.maxPoints = reglas?.pointsToWin || 0;
    } catch (error) {
      console.error('Error al cargar las reglas:', error);
    }
  }

  private async registrarParticipante(userId: string) {
    const currentUser = await this.authService.getCurrentUserAsync();
    const userName = currentUser?.displayName || 'Usuario Anónimo';
    const participante: ParticipantModel = {
      id: userId,
      name: userName,
      victories: 0,
      score: 0,
    };
    await this.participantesService.addParticipante(participante);
  }

  refreshParticipantes() {
    this.participantesService.getParticipantesTiempoReal((participantes) => {
      this.participantes = participantes;
      this.setCurrentParticipante();
      this.verificarGanador();
    });
  }

  incrementarPuntaje(participanteId: string) {
    if (this.ganador) {
      return;
    }

    const participante = this.participantes.find((p) => p.id === participanteId);
    if (participante) {
      participante.score += 1;
      this.animatingParticipantId = participanteId; // Aplicar animación
      setTimeout((): void => (this.animatingParticipantId = null), 500); // Quitar animación después de 500ms

      this.participantesService.addParticipante(participante);

      if (participante.score >= this.maxPoints) {
        this.definirGanador(participante.name);
      }
    }
  }

  private definirGanador(nombreGanador: string) {
    this.ganador = nombreGanador;
  }

  private verificarGanador() {
    const ganador = this.participantes.find((p) => p.score >= this.maxPoints);
    if (ganador && !this.ganador) {
      this.definirGanador(ganador.name);
    }
  }

  private setCurrentParticipante() {
    this.currentParticipante = this.participantes.find(
      (p) => p.id === this.currentUserId
    ) || null;
  }
}
