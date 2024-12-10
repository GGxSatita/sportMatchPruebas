import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel, SportType } from 'src/app/models/desafio';
import { Subscription, interval } from 'rxjs';
import { gsap } from 'gsap';
import { ToastController } from '@ionic/angular';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonButton,
  IonProgressBar,
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
    IonProgressBar,
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
  progressValue: number = 0;

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private reglasService: ReglasService,
    private eventosService: EventosService,
    private authService: AutenticacionService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId')!;
    if (!this.eventId) {
      console.error('Error: No se proporcionó eventId');
      return;
    }
    this.eventName = await this.obtenerTituloDelEvento(this.eventId);
    this.currentUserId =
      (await this.authService.getCurrentUserAsync())?.uid || '';
    const participanteRegistrado =
      await this.participantesService.getParticipanteByEventAndUser(
        this.eventId,
        this.currentUserId
      );
    await this.loadEventDetails();
    await this.loadReglas();
    this.refreshParticipantes();
    if (!participanteRegistrado) {
      await this.registrarParticipante(); // Registrar al participante si no existe
    }

    // Intentar cargar el valor de mostrarSeleccionEquipo desde localStorage

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
  actualizarProgreso() {
    // Encontrar el puntaje más alto de los participantes
    const puntajeMasAlto = Math.max(...this.participantes.map((p) => p.score));

    // Calcular el porcentaje de progreso
    const porcentajeProgreso = (puntajeMasAlto / this.maxPoints) * 100;

    // Actualizar el valor de progressValue, asegurándonos de que no exceda el 100%
    this.progressValue = Math.min(100, porcentajeProgreso);
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
      photo: currentUser?.photoURL || 'assets/default-profile.png',
      deportes: {
        'Taka Taka': { score: 0, rank: 'Principiante' },
        'Handbol': { score: 0, rank: 'Principiante' },
        'Fútbol': { score: 0, rank: 'Principiante' },
        'Baloncesto': { score: 0, rank: 'Principiante' },
        'Voleibol': { score: 0, rank: 'Principiante' },
        'Tenis': { score: 0, rank: 'Principiante' },
        'Splendor': { score: 0, rank: 'Principiante' },
        'Catan': { score: 0, rank: 'Principiante' },
        'Dixit': { score: 0, rank: 'Principiante' },
        'Uno': { score: 0, rank: 'Principiante' },
      }
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
        this.actualizarProgreso();
      }
    );
  }

  async incrementarRonda() {
    // Verificar si ya existe un ganador
    if (this.ganador) {
      const toast = await this.toastController.create({
        message:
          'El evento ya tiene un ganador. No puedes aumentar más puntos.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    // Encontrar al participante actual
    const currentParticipante = this.participantes.find(
      (p) => p.id === this.currentUserId
    );

    // Si el participante actual existe, incrementar su puntaje
    if (currentParticipante) {
      currentParticipante.score += 1; // Incrementa el puntaje del participante
      this.animarTarjeta(currentParticipante.id); // Realiza la animación de la tarjeta
    }

    // Llamar al servicio para actualizar el puntaje del participante en la base de datos
    await this.participantesService.addParticipante(
      currentParticipante!,
      this.eventId
    );

    // Verificar si el participante actual o algún otro ha alcanzado el puntaje máximo
    this.verificarGanador();
  }

  private async verificarGanador() {
    try {
      // Identificar al ganador basado en el puntaje
      const ganador = this.participantes.find((p) => p.score >= this.maxPoints);

      if (!ganador) {
        console.warn('No se encontró un ganador válido.');
        return;
      }

      // Verificar si ya se registró un ganador
      if (this.ganador) {
        console.warn('El ganador ya ha sido registrado previamente.');
        return;
      }

      // Asignar el nombre del ganador
      this.ganador = ganador.name;
      console.log(`Ganador identificado: ${this.ganador}`);

      // Obtener el deporte relacionado con el evento
      const deporteDelEvento = await this.obtenerDeporteDelEvento(this.eventId);
      console.log(`Deporte asociado al evento: ${deporteDelEvento}`);

      // Procesar todos los participantes
      for (const participante of this.participantes) {
        const puntos = participante.id === ganador.id ? 10 : -5; // 10 puntos para el ganador, -5 para los demás

        console.log(
          `Procesando participante: ${participante.name}, Puntos asignados: ${puntos}`
        );

        // Guardar puntaje en Firestore
        await this.participantesService.guardarPuntaje(
          participante,
          deporteDelEvento,
          puntos
        );
      }

      // Registrar el evento como terminado
      await this.eventosService.marcarEventoComoTerminado(this.eventId);
      console.log(`El evento ${this.eventId} se marcó como terminado.`);
    } catch (error) {
      console.error('Error en verificarGanador:', error);
    }
  }



  // Método para obtener el deporte relacionado con el evento
  private async obtenerDeporteDelEvento(eventId: string): Promise<SportType> {
    try {
      // Obtener el evento, puedes usar tu servicio para obtener los detalles
      const evento = await this.eventosService.getEvento(eventId);
      if (evento && evento.deporte) {
        return evento.deporte as SportType; // Asegúrate de que el valor sea un SportType
      } else {
        console.warn(`El evento ${eventId} no tiene un deporte asociado.`);
        return 'OTRO' as SportType; // Valor por defecto
      }
    } catch (error) {
      console.error('Error al obtener el deporte del evento:', error);
      return 'OTRO' as SportType; // Valor por defecto en caso de error
    }
  }

  private setCurrentParticipante() {
    this.currentParticipante =
      this.participantes.find((p) => p.id === this.currentUserId) || null;
  }

  volverAlInicio() {
    this.router.navigate(['/menu-principal']);
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
