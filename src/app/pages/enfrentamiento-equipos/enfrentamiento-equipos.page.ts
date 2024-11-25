import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel } from 'src/app/models/desafio';
import { Subscription, interval } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonButton,
  IonRadioGroup,
  IonRadio,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { gsap } from 'gsap';
import { EventosService } from 'src/app/services/evento.service';

@Component({
  selector: 'app-enfrentamiento-equipos',
  templateUrl: './enfrentamiento-equipos.page.html',
  styleUrls: ['./enfrentamiento-equipos.page.scss'],
  standalone: true,
  imports: [
    IonRadio,
    IonRadioGroup,
    IonButton,
    IonIcon,
    IonAvatar,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
  ],
})
export class EnfrentamientoEquiposPage implements OnInit, OnDestroy {
  participantes: ParticipantModel[] = [];
  equipos: { name: string; score: number }[] = [];
  maxPoints: number = 0;
  eventId: string = '';
  autoRefreshSubscription!: Subscription;
  equipoSeleccionado: string = '';
  mostrarSeleccionEquipo: boolean = true;
  animatingParticipantId: string | null = null;
  ganador: string | null = null;
  currentUserId: string = '';
  eventName: string = '';

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private eventosService: EventosService,
    private reglasService: ReglasService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId')!;
    if (!this.eventId) {
      console.error('Error: No se proporcionó eventId');
      return;
    }

    await this.loadEventDetails();
    await this.loadReglas();
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

  private async loadEventDetails() {
    try {
      const evento = await this.eventosService.getEvento(this.eventId);
      this.eventName = evento?.titulo || 'Sin Título';
      const currentUser = await this.authService.getCurrentUserAsync();
      this.currentUserId = currentUser?.uid || '';
    } catch (error) {
      console.error('Error cargando detalles del evento:', error);
    }
  }

  private async loadReglas() {
    try {
      const reglas = await this.reglasService.getReglasByEventId(this.eventId);
      this.maxPoints = reglas?.pointsToWin || 10;

      if (reglas?.esPorEquipos) {
        this.equipos = [
          { name: 'Equipo 1', score: 0 },
          { name: 'Equipo 2', score: 0 },
        ];
      } else {
        this.equipos = [];
      }
    } catch (error) {
      console.error('Error cargando las reglas del evento:', error);
      this.maxPoints = 10;
      this.equipos = [
        { name: 'Equipo 1', score: 0 },
        { name: 'Equipo 2', score: 0 },
      ];
    }
  }

  refreshParticipantes() {
    this.participantesService.getParticipantesTiempoReal(
      this.eventId,
      (participantes) => {
        this.participantes = participantes;
        this.actualizarPuntajesDeEquipos();
        this.verificarGanador();
      }
    );
  }

  actualizarPuntajesDeEquipos() {
    this.equipos.forEach((equipo) => (equipo.score = 0));
    this.participantes.forEach((p) => {
      const equipo = this.equipos.find((e) => e.name === p.equipo);
      if (equipo) equipo.score += p.score;
    });
  }

  getParticipantesPorEquipo(equipoName: string): ParticipantModel[] {
    return this.participantes.filter((p) => p.equipo === equipoName);
  }

  incrementarRondaEquipo() {
    const currentUser = this.participantes.find(
      (p) => p.id === this.currentUserId
    );
    if (currentUser) {
      currentUser.score += 1;
      this.animarTarjeta(currentUser.id);
    }

    const equipo = this.equipos.find((e) => e.name === currentUser?.equipo);
    if (equipo) {
      equipo.score += 1;
    }

    this.participantesService.addParticipante(currentUser!, this.eventId);
    this.verificarGanador();
  }

  async incrementarPuntaje(participanteId: string) {
    const participante = this.participantes.find((p) => p.id === participanteId);
    if (!participante) return;

    if (this.ganador) {
      console.warn('Ya existe un ganador: ', this.ganador);
      return;
    }

    participante.score += 1;

    const equipo = this.equipos.find((e) => e.name === participante.equipo);
    if (equipo) equipo.score += 1;

    this.animarTarjeta(participanteId);
    await this.participantesService.addParticipante(participante, this.eventId);
    this.verificarGanador();
  }

  verificarGanador() {
    const equipoGanador = this.equipos.find((e) => e.score >= this.maxPoints);
    if (equipoGanador && !this.ganador) {
      this.ganador = equipoGanador.name;

      // Guardar puntaje para todos los participantes del equipo ganador
      const participantesGanadores = this.participantes.filter(
        (p) => p.equipo === equipoGanador.name
      );

      participantesGanadores.forEach((participante) => {
        this.participantesService.guardarPuntaje(participante, true);
      });
    }
  }

  async unirseAEquipo() {
    if (!this.equipoSeleccionado) {
      console.error('Error: No se ha seleccionado un equipo');
      return;
    }

    const currentUser = await this.authService.getCurrentUserAsync();
    const userId = currentUser?.uid || '';
    const userName = currentUser?.displayName || 'Usuario Anónimo';

    const participante: ParticipantModel = {
      id: userId,
      name: userName,
      victories: 0,
      score: 0,
      equipo: this.equipoSeleccionado,
      photo: currentUser?.photoURL || 'assets/default-profile.png',
    };

    await this.participantesService.addParticipanteConEquipo(
      participante,
      this.eventId,
      this.equipoSeleccionado
    );

    this.mostrarSeleccionEquipo = false;
    this.refreshParticipantes();
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
        {
          scale: 1.1,
          backgroundColor: '#ffcc00',
          duration: 0.5,
          yoyo: true,
          repeat: 1,
        }
      );
    }
  }
  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Imagen por defecto si la URL falla
  }

}
