import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipantesService } from 'src/app/services/participantes.service';
import { ReglasService } from 'src/app/services/reglas.service';
import { ParticipantModel, SportType } from 'src/app/models/desafio';
import { Subscription, interval } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ToastController } from '@ionic/angular';
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
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonProgressBar,
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
    IonProgressBar,
    IonCardContent,
    IonCardHeader,
    IonCard,
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
  progressValue: number = 0;

  constructor(
    private route: ActivatedRoute,
    private participantesService: ParticipantesService,
    private eventosService: EventosService,
    private reglasService: ReglasService,
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
    await this.loadEventDetails();
    await this.loadReglas();
    this.checkEquipoSeleccionado();
    this.refreshParticipantes();

    // Intentar cargar el valor de mostrarSeleccionEquipo desde localStorage
    const storedValue = localStorage.getItem('mostrarSeleccionEquipo');
    if (storedValue === 'false') {
      this.mostrarSeleccionEquipo = false;
    } else {
      this.mostrarSeleccionEquipo = true;
    }

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
  actualizarProgreso() {
    // Encontrar el equipo con el puntaje más alto
    const puntajeEquipoMasAlto = Math.max(
      ...this.equipos.map((equipo) => equipo.score)
    );

    // Calcular el porcentaje de progreso basado en el puntaje del equipo más alto
    const porcentajeProgreso = (puntajeEquipoMasAlto / this.maxPoints) * 100;

    // Actualizar el valor de progressValue, asegurándonos de que no exceda el 100%
    this.progressValue = Math.min(100, porcentajeProgreso);
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
          { name: 'Equipo Alpha', score: 0 },
          { name: 'Equipo Omega', score: 0 },
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

  private async checkEquipoSeleccionado() {
    try {
      const currentUser = await this.authService.getCurrentUserAsync();
      this.currentUserId = currentUser?.uid || '';

      if (!this.currentUserId) {
        console.error('No se encontró el ID del usuario actual.');
        return;
      }

      // Verificar si el participante ya tiene un equipo asignado
      const participante =
        await this.participantesService.getParticipanteByEventAndUser(
          this.eventId,
          this.currentUserId
        );

      if (participante && participante.equipo) {
        console.log('Usuario ya tiene equipo asignado:', participante.equipo);
        // Ocultar selección de equipo y mostrar el enfrentamiento
        this.mostrarSeleccionEquipo = false;
        localStorage.setItem('mostrarSeleccionEquipo', 'false'); // Guardar en localStorage
      } else {
        console.log(
          'El usuario no tiene equipo asignado. Mostrando selección de equipo.'
        );
        this.mostrarSeleccionEquipo = true;
        localStorage.setItem('mostrarSeleccionEquipo', 'true'); // Guardar en localStorage
      }
    } catch (error) {
      console.error(
        'Error verificando si el usuario ya eligió un equipo:',
        error
      );
      // Mostrar algún tipo de mensaje de error o recuperación en la interfaz
      const toast = await this.toastController.create({
        message: 'Hubo un problema al verificar el equipo del usuario.',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  refreshParticipantes() {
    this.participantesService.getParticipantesTiempoReal(
      this.eventId,
      (participantes) => {
        this.participantes = participantes;
        this.actualizarPuntajesDeEquipos();
        this.verificarGanador();
        this.actualizarProgreso();
      }
    );
  }

  actualizarPuntajesDeEquipos() {
    let puntajesActualizados = false;

    // Primero, resetear puntajes
    this.equipos.forEach((equipo) => (equipo.score = 0));

    // Actualizamos los puntajes con la información de los participantes
    this.participantes.forEach((p) => {
      const equipo = this.equipos.find((e) => e.name === p.equipo);
      if (equipo) {
        // Se asegura que el puntaje se incremente correctamente sin perder datos anteriores
        equipo.score += p.score;
        puntajesActualizados = true;
      }
    });

    // Solo actualiza el progreso si los puntajes han cambiado
    if (puntajesActualizados) {
      this.actualizarProgreso();
    }
  }

  // Función agregada para obtener participantes por equipo
  getParticipantesPorEquipo(equipoName: string): ParticipantModel[] {
    return this.participantes.filter((p) => p.equipo === equipoName);
  }

  async incrementarRondaEquipo() {
    // Verificar si ya existe un ganador
    if (this.ganador) {
      console.warn('Ya existe un ganador:', this.ganador);
      const toast = await this.toastController.create({
        message:
          'El evento ya tiene un ganador. No puedes aumentar más puntos.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

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
    const participante = this.participantes.find(
      (p) => p.id === participanteId
    );
    if (!participante) {
      console.error(`Participante con id ${participanteId} no encontrado.`);
      return;
    }

    // Verificar si ya existe un ganador
    if (this.ganador) {
      console.warn('Ya existe un ganador:', this.ganador);
      const toast = await this.toastController.create({
        message:
          'El evento ya tiene un ganador. No puedes aumentar más puntos.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    participante.score += 1;

    const equipo = this.equipos.find((e) => e.name === participante.equipo);
    if (equipo) equipo.score += 1;

    this.animarTarjeta(participante.id);

    await this.participantesService.addParticipante(participante, this.eventId);
    this.verificarGanador();
  }

  private async verificarGanador() {
    const equipoGanador = this.equipos.find((e) => e.score >= this.maxPoints);
    if (equipoGanador && !this.ganador) {
      this.ganador = equipoGanador.name;
      // Obtener el deporte relacionado con el evento
      const deporteDelEvento = this.obtenerDeporteDelEvento(this.eventId); // Método para obtener el deporte asociado al evento
      // Guardar puntaje para todos los participantes del equipo ganador
      const participantesGanadores = this.participantes.filter(
        (p) => p.equipo === equipoGanador.name
      );

      participantesGanadores.forEach(async (participante) => {
        this.participantesService.guardarPuntaje(
          participante,
          await deporteDelEvento ,
          true
        );
      });

      // Registrar que el evento ha terminado
      this.eventosService
        .marcarEventoComoTerminado(this.eventId)
        .then(() => {
          console.log(`El evento ${this.eventId} se marcó como terminado.`);
        })
        .catch((error) => {
          console.error('Error al marcar el evento como terminado:', error);
        });
    }
  }
  private async obtenerDeporteDelEvento(eventId: string): Promise<SportType> {
    // Aquí deberías obtener el evento y su deporte
    return this.eventosService.getEvento(eventId).then((evento) => {
      if (evento && evento.deporte) {
        return evento.deporte as SportType; // Asegurándote de que el deporte es del tipo SportType
      } else {
        console.warn(`El evento con ID ${eventId} no tiene un deporte asignado.`);
        return 'default' as SportType; // Esto es solo un ejemplo, ajusta según tu lógica
      }
    });
  }
  async unirseAEquipo() {
    const currentUser = await this.authService.getCurrentUserAsync();
    const userId = currentUser?.uid || '';

    // Verificar si el usuario ya tiene un equipo asignado
    const participante =
      await this.participantesService.getParticipanteByEventAndUser(
        this.eventId,
        userId
      );

    if (participante) {
      // Si el participante ya tiene un equipo asignado, no permitir seleccionar otro equipo
      if (participante.equipo) {
        console.log(
          `El participante ya pertenece al equipo ${participante.equipo}`
        );
        // Mostrar un mensaje de advertencia o solo salir de la función si ya tiene equipo
        this.mostrarSeleccionEquipo = false; // Ocultar la selección de equipo
        localStorage.setItem('mostrarSeleccionEquipo', 'false'); // Actualizar el valor en localStorage
        return; // Salir de la función para no continuar con el registro
      }
    }

    if (!this.equipoSeleccionado) {
      console.error('Error: No se ha seleccionado un equipo');
      return;
    }

    const userName = currentUser?.displayName || 'Usuario Anónimo';
    const participanteNuevo: ParticipantModel = {
      id: userId,
      name: userName,
      victories: 0,
      score: 0,
      equipo: this.equipoSeleccionado,
      photo: currentUser?.photoURL || 'assets/default-profile.png',
      deportes: {
        'Taka Taka': { score: 0, rank: 'Principiante' },
        Handbol: { score: 0, rank: 'Principiante' },
        Fútbol: { score: 0, rank: 'Principiante' },
        Baloncesto: { score: 0, rank: 'Principiante' },
        Voleibol: { score: 0, rank: 'Principiante' },
        Tenis: { score: 0, rank: 'Principiante' },
        Splendor: { score: 0, rank: 'Principiante' },
        Catan: { score: 0, rank: 'Principiante' },
        Dixit: { score: 0, rank: 'Principiante' },
        Uno: { score: 0, rank: 'Principiante' },
      },
    };

    // Registrar al participante con el equipo seleccionado
    await this.participantesService.addParticipanteConEquipo(
      participanteNuevo,
      this.eventId,
      this.equipoSeleccionado
    );

    // Cambiar el estado de la selección de equipo
    this.mostrarSeleccionEquipo = false; // Ocultar la selección de equipo después de registrarlo
    localStorage.setItem('mostrarSeleccionEquipo', 'false'); // Guardar en localStorage

    // Refrescar la lista de participantes o cualquier otra acción necesaria
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

  // Función para manejar errores en la carga de imágenes
  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Imagen por defecto si la URL falla
  }
}
