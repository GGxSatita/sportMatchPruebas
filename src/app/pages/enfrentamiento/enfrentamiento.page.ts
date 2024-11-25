import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel } from 'src/app/models/desafio';
import { Subscription, interval } from 'rxjs';
import { gsap } from 'gsap';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { EventosService } from 'src/app/services/evento.service';

@Component({
  selector: 'app-enfrentamiento',
  templateUrl: './enfrentamiento.page.html',
  styleUrls: ['./enfrentamiento.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonIcon,
    IonButton,
    HeaderComponent,
    FooterComponent,
    CommonModule,
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
  eventName: string = '';

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private reglasService: ReglasService,
    private eventosService: EventosService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId')!;
    if (!this.eventId) {
      console.error('Error: No se proporcionó eventId');
      return;
    }

    this.eventName = await this.obtenerTituloDelEvento(this.eventId);
    this.currentUserId = (await this.authService.getCurrentUserAsync())?.uid || '';

    await this.loadReglas();
    await this.registrarParticipante();

    this.refreshParticipantes();
    this.autoRefreshSubscription = interval(10000).subscribe(() => {
      this.refreshParticipantes();
    });
  }

  ngOnDestroy() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  async obtenerTituloDelEvento(eventId: string): Promise<string> {
    const evento = await this.eventosService.getEvento(eventId);
    return evento?.titulo || 'Evento Sin Nombre';
  }

  private async loadReglas() {
    const reglas = await this.reglasService.getReglasByEventId(this.eventId);
    this.maxPoints = reglas?.pointsToWin || 0;
  }

  private async registrarParticipante() {
    const currentUser = await this.authService.getCurrentUserAsync();
    const participante: ParticipantModel = {
      id: currentUser?.uid || '',
      name: currentUser?.displayName || 'Usuario Anónimo',
      victories: 0,
      score: 0,
      equipo: '', // No aplica para enfrentamientos normales
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
  incrementarRonda() {
    this.participantes.forEach(async (participante) => {
      participante.score += 1; // Incrementa el puntaje de todos los participantes
      this.animarTarjeta(participante.id); // Realiza la animación de la tarjeta
      await this.participantesService.addParticipante(participante, this.eventId); // Actualiza en Firestore
    });

    this.verificarGanador(); // Verifica si alguno alcanzó el puntaje máximo
  }
  async incrementarPuntaje(participanteId: string) {
    const participante = this.participantes.find((p) => p.id === participanteId);
    if (!participante) return;

    if (this.ganador) {
      console.warn('Ya existe un ganador:', this.ganador);
      return;
    }

    participante.score += 1;

    this.animarTarjeta(participante.id);

    if (participante.score >= this.maxPoints) {
      this.ganador = participante.name;

      // Guardar puntaje del ganador
      await this.participantesService.guardarPuntaje(participante, true);
    } else {
      // Guardar puntaje del participante sin victoria
      await this.participantesService.guardarPuntaje(participante, false);
    }

    await this.participantesService.addParticipante(participante, this.eventId);
  }

  private verificarGanador() {
    const ganador = this.participantes.find((p) => p.score >= this.maxPoints);
    if (ganador && !this.ganador) {
      this.ganador = ganador.name;
    }
  }

  private setCurrentParticipante() {
    this.currentParticipante =
      this.participantes.find((p) => p.id === this.currentUserId) || null;
  }

  volverAlInicio() {
    this.router.navigate(['/menu-principal']);
  }

  volverAListaEventos() {
    this.router.navigate(['/evento-list']);
  }

  animarTarjeta(participanteId: string) {
    const playerCard = document.getElementById(`card-${participanteId}`);
    if (playerCard) {
      gsap.fromTo(
        playerCard,
        { scale: 1, backgroundColor: '#fff' },
        { scale: 1.1, backgroundColor: '#ffcc00', duration: 0.5, yoyo: true, repeat: 1 }
      );
    }
  }
  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Imagen por defecto si la URL falla
  }
}
