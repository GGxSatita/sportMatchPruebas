import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonItemDivider } from '@ionic/angular/standalone';
import { EventosService } from 'src/app/services/evento.service';
import { eventos } from 'src/app/models/evento';
import { Auth } from '@angular/fire/auth';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';
import { eventosAdmin } from 'src/app/models/evento-admin';
import { EventoAdminService } from 'src/app/services/evento-admin.service';

@Component({
  selector: 'app-evento-alumno',
  templateUrl: './evento-alumno.page.html',
  styleUrls: ['./evento-alumno.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Habilita elementos personalizados de Ionic
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonItemDivider, // Asegúrate de importarlo
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
  ]
})
export class EventoAlumnoPage implements OnInit {
  eventosInscritosAdmin: eventosAdmin[] = [];
  eventosAprobados: eventos[] = [];
  eventosEnEspera: eventos[] = [];
  eventosInscritos: eventos[] = [];
  idAlumno: string | null = null;
  eventosAprobadosOInscritos: eventos[] = [];


  constructor(
    private eventosService: EventosService,
    private auth: Auth,
    private router: Router,
    private eventoAdminService: EventoAdminService
  ) {}

  ngOnInit() {
    this.loadAlumnoId();
  }

  verDetallesEvento(evento: eventos) {
    console.log('Detalles del evento:', evento);
    // Aquí puedes navegar a una nueva página o mostrar un modal con más información.
  }


  async loadAlumnoId() {
    const user = this.auth.currentUser;
    if (user) {
      this.idAlumno = user.uid;
      this.loadEventos();
    } else {
      console.error('No hay usuario autenticado.');
    }
  }




  loadEventos(): void {
    this.eventosService.getEventos().subscribe((eventos) => {
      if (!this.idAlumno) return;

      // Filtramos eventos aprobados e inscritos por el alumno autenticado
      this.eventosAprobadosOInscritos = eventos.filter(evento =>
        (evento.espera && evento.idAlumno === this.idAlumno) ||
        evento.participantesActuales?.includes(this.idAlumno)
      );

      // Filtramos los eventos en espera específicamente del alumno autenticado
      this.eventosEnEspera = eventos.filter(evento =>
        !evento.espera && evento.idAlumno === this.idAlumno
      );
    });
  }

  configurarDesafio(evento: eventos) {
    console.log('Configurando desafío para el evento:', evento);
    this.router.navigate(['/configurar-desafio', evento.idEventosAlumnos]);
  }


  eliminarEvento(evento: eventos) {
    if (evento.idAlumno === this.idAlumno) {
      this.eventosService.deleteEvento(evento.idEventosAlumnos).then(
        () => {
          console.log(`Evento ${evento.idEventosAlumnos} eliminado exitosamente.`);
          // Actualizamos la lista de eventos después de eliminar
          this.loadEventos();
        }
      ).catch(
        (error: any) => {
          console.error('Error al eliminar el evento:', error);
        }
      );
    } else {
      console.error('No tienes permiso para eliminar este evento.');
    }
  }


}
