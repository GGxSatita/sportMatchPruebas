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
  eventosAprobados: eventos[] = [];
  eventosEnEspera: eventos[] = [];
  eventosInscritos: eventos[] = [];
  idAlumno: string | null = null;

  constructor(
    private eventosService: EventosService,
    private auth: Auth,
    private router: Router
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
      const eventosDelAlumno = eventos.filter(evento => evento.idAlumno === this.idAlumno);

      // Filtramos eventos aprobados y en espera
      this.eventosAprobados = eventosDelAlumno.filter(evento => evento.espera);
      this.eventosEnEspera = eventosDelAlumno.filter(evento => !evento.espera);

      // Filtramos los eventos donde el usuario esté inscrito
      this.eventosInscritos = eventos.filter(evento =>
        evento.participantesActuales?.includes(this.idAlumno)
      );
    });
  }

  configurarDesafio(evento: eventos) {
    console.log('Configurando desafío para el evento:', evento);
    this.router.navigate(['/configurar-desafio', evento.idEventosAlumnos]);
  }

}
