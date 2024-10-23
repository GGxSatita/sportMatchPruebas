import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
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
import { AlertController } from '@ionic/angular';


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
  eventosAprobadosOInscritos: eventos[] = [];
  eventosAdminInscritos: eventosAdmin[] = [];


  constructor(
    private eventosService: EventosService,
    private auth: Auth,
    private router: Router,
    private eventoAdminService: EventoAdminService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadAlumnoId();
    this.loadAlumnoIdAdmin();
  }

  verDetallesEvento(evento: eventos | eventosAdmin) {
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


  configurarDesafio(evento: eventos) {
    this.router.navigate(['/desafio'], { queryParams: { evento: JSON.stringify(evento) } });
  }
  async loadAlumnoIdAdmin() {
    const user = this.auth.currentUser;
    if (user) {
      this.idAlumno = user.uid;
      this.loadEventosAdmin();
    } else {
      console.error('No hay usuario autenticado.');
    }
  }


  loadEventos(): void {
    this.eventosService.getEventos().subscribe((eventos) => {
      if (!this.idAlumno) return;

      // Filtrar eventos aprobados e inscritos por el alumno autenticado
      this.eventosAprobadosOInscritos = eventos.filter(evento =>
        (evento.espera && evento.idAlumno === this.idAlumno) ||
        evento.participantesActuales?.includes(this.idAlumno)
      );

      // Filtrar los eventos en espera específicamente del alumno autenticado
      this.eventosEnEspera = eventos.filter(evento =>
        !evento.espera && evento.idAlumno === this.idAlumno
      );
    });
  }

  loadEventosAdmin(): void {
    this.eventoAdminService.getEventos().subscribe((eventosAdmin) => {
      if (!this.idAlumno) return;

      // Filtrar eventos administrados en los que el alumno está inscrito
      this.eventosAdminInscritos = eventosAdmin.filter(eventoAdmin =>
        eventoAdmin.participants.includes(this.idAlumno) && eventoAdmin.status === true
      );
    });
  }

  esEventoAlumno(evento: eventos | eventosAdmin): evento is eventos {
    return (evento as eventos).idAlumno !== undefined;
  }

  getDisponibilidad(evento: eventos): string {
    return evento.espera ? 'Disponible' : 'No Disponible';
  }

  async eliminarEvento(evento: eventos | eventosAdmin) {
    if (this.esEventoAlumno(evento) && evento.idAlumno === this.idAlumno) {
      const alert = await this.alertController.create({
        header: 'Cancelar evento',
        message: `¿Estás seguro de que deseas cancelar el evento? Esta acción no se puede deshacer.`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación de evento cancelada por el usuario.');
            }
          },
          {
            text: 'Cancelar',
            handler: () => {
              const idEvento = evento.idEventosAlumnos;
              this.eventosService.deleteEvento(idEvento).then(
                () => {
                  console.log(`Evento ${idEvento} eliminado exitosamente.`);
                  // Actualizamos la lista de eventos después de eliminar
                  this.loadEventos();
                }
              ).catch(
                (error: any) => {
                  console.error('Error al eliminar el evento:', error);
                }
              );
            }
          }
        ]
      });

      await alert.present();
    } else {
      console.error('No tienes permiso para eliminar este evento.');
    }
  }

  async cancelarInscripcion(evento: eventos) {
    if (evento.participantesActuales?.includes(this.idAlumno!)) {
      const alert = await this.alertController.create({
        header: 'Cancelar inscripción',
        message: `¿Estás seguro de que deseas cancelar tu inscripción en este evento?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Cancelación de inscripción detenida por el usuario.');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              // Encontrar el índice del ID del alumno en la lista de participantes
              const index = evento.participantesActuales.indexOf(this.idAlumno!);

              if (index > -1) {
                // Eliminar el ID del alumno de la lista de participantes
                evento.participantesActuales.splice(index, 1);

                try {
                  // Actualizar el evento con la nueva lista de participantes
                  await this.eventosService.updateEvento(evento.idEventosAlumnos, { participantesActuales: evento.participantesActuales });
                  console.log(`Inscripción en el evento ${evento.idEventosAlumnos} cancelada exitosamente.`);
                  // Actualizamos la lista de eventos después de cancelar la inscripción
                  this.loadEventos();
                } catch (error) {
                  console.error('Error al cancelar la inscripción en el evento:', error);
                }
              }
            }
          }
        ]
      });

      await alert.present();
    } else {
      console.error('No estás inscrito en este evento o no se permite cancelar la inscripción.');
    }
  }


  async cancelarInscripcionAdmin(evento: eventosAdmin) {
    if (evento.participants.includes(this.idAlumno!)) {
      const alert = await this.alertController.create({
        header: 'Cancelar inscripción',
        message: `¿Estás seguro de que deseas cancelar tu inscripción en este evento?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Cancelación de inscripción detenida por el usuario.');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              // Encontrar el índice del ID del alumno en la lista de participantes
              const index = evento.participants.indexOf(this.idAlumno!);

              if (index > -1) {
                // Eliminar el ID del alumno de la lista de participantes
                evento.participants.splice(index, 1);

                try {
                  // Actualizar el evento con la nueva lista de participantes
                  await this.eventoAdminService.updateEvento(evento.idEventosAdmin, { participants: evento.participants });
                  console.log(`Inscripción en el evento ${evento.idEventosAdmin} cancelada exitosamente.`);
                  // Actualizamos la lista de eventos después de cancelar la inscripción
                  this.loadEventosAdmin();
                } catch (error) {
                  console.error('Error al cancelar la inscripción en el evento:', error);
                }
              }
            }
          }
        ]
      });

      await alert.present();
    } else {
      console.error('No estás inscrito en este evento o no se permite cancelar la inscripción.');
    }
  }




  
}
