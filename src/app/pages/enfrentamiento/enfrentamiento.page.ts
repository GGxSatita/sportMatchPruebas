import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel } from 'src/app/models/desafio';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { interval, Subscription } from 'rxjs';
import {
  IonList,
  IonContent,
  IonItem,
  IonAvatar,
  IonIcon,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enfrentamiento',
  templateUrl: './enfrentamiento.page.html',
  styleUrls: ['./enfrentamiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonLabel,
    IonIcon,
    IonAvatar,
    IonItem,
    IonContent,
    IonList,
    FooterComponent,
    HeaderComponent,
  ],
})
export class EnfrentamientoPage implements OnInit, OnDestroy {
  participantes: ParticipantModel[] = [];
  currentUserId: string = '';
  maxPoints: number = 0;
  ganador: string | null = null;
  autoRefreshSubscription!: Subscription;
  currentParticipante: ParticipantModel | null = null;
  animatingParticipantId: string | null = null;
  eventId: string = '';

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private reglasService: ReglasService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.currentUserId = this.authService.getUserId() || '';

    if (!this.currentUserId) {
      console.error('Error: Usuario no autenticado');
      return;
    }

    this.eventId = this.route.snapshot.queryParamMap.get('eventId')!;
    if (!this.eventId) {
      console.error('Error: No se proporcionó eventId');
      return;
    }

    // Cargar reglas del evento
    await this.loadReglas();

    // Registrar al usuario actual
    await this.registrarParticipante();

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

  private async loadReglas() {
    try {
      const reglas = await this.reglasService.getReglasByEventId(this.eventId);
      this.maxPoints = reglas?.pointsToWin || 0;
    } catch (error) {
      console.error('Error al cargar las reglas:', error);
    }
  }

  private async registrarParticipante() {
    const currentUser = await this.authService.getCurrentUserAsync();
    const userName = currentUser?.displayName || 'Usuario Anónimo';
    const participante: ParticipantModel = {
      id: this.currentUserId,
      name: userName,
      victories: 0,
      score: 0,
    };
    await this.participantesService.addParticipante(participante, this.eventId);
  }

  refreshParticipantes() {
    this.participantesService.getParticipantesTiempoReal(
      this.eventId,
      (participantes) => {
        this.participantes = participantes;
        this.setCurrentParticipante();
        this.verificarGanador();
      }
    );
  }

  async incrementarPuntaje(participanteId: string) {
    const participante = this.participantes.find(
      (p) => p.id === participanteId
    );

    if (participante) {
      if (this.ganador) {
        console.warn('El enfrentamiento ya tiene un ganador:', this.ganador);
        return;
      }

      participante.score += 1;

      // Verificar si el participante alcanzó el máximo de puntos
      if (participante.score >= this.maxPoints) {
        this.ganador = participante.name;

        // Guardar puntaje del ganador
        await this.participantesService.guardarPuntaje(participante, true);

        // Guardar puntaje de los perdedores
        const perdedores = this.participantes.filter(
          (p) => p.id !== participanteId
        );
        for (const perdedor of perdedores) {
          await this.participantesService.guardarPuntaje(perdedor, false);
        }

        console.log(`¡Ganador declarado!: ${this.ganador}`);
      }

      // Animar puntos
      this.animatingParticipantId = participanteId;
      setTimeout((): void => (this.animatingParticipantId = null), 500);

      console.log(
        `Puntaje actualizado para ${participante.name}: ${participante.score}`
      );
      this.participantesService.addParticipante(participante, this.eventId); // Actualizar participante en Firestore
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
    this.currentParticipante =
      this.participantes.find((p) => p.id === this.currentUserId) || null;
  }
  // Método para volver al inicio
  volverAlInicio() {
    this.router.navigate(['/inicio']); // Ajusta la ruta según tu aplicación
  }

  // Método para volver a la lista de eventos
  volverAListaEventos() {
    this.router.navigate(['/eventos']); // Ajusta la ruta según tu aplicación
  }
}
