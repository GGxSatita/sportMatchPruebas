import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonItemDivider, IonIcon } from '@ionic/angular/standalone';
import { EventosService } from 'src/app/services/evento.service';
import { eventos } from 'src/app/models/evento';
import { Auth } from '@angular/fire/auth';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';
import { eventosAdmin } from 'src/app/models/evento-admin';
import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { AlertController } from '@ionic/angular';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-evento-alumno',
  templateUrl: './evento-alumno.page.html',
  styleUrls: ['./evento-alumno.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonItemDivider,
    CommonModule,
    FormsModule,
    IonIcon,
    HeaderComponent,
    FooterComponent,
  ]
})
export class EventoAlumnoPage implements OnInit, OnDestroy {
  eventosAprobados: eventos[] = [];
  eventosEnEspera: eventos[] = [];
  eventosInscritos: eventos[] = [];
  idAlumno: string | null = null;
  eventosAprobadosOInscritos: eventos[] = [];
  eventosAdminInscritos: eventosAdmin[] = [];
  private html5Qrcode: Html5Qrcode | null = null;

  constructor(
    private eventosService: EventosService,
    private auth: Auth,
    private router: Router,
    private eventoAdminService: EventoAdminService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.loadAlumnoId();
    this.loadAlumnoIdAdmin();
  }

  ngOnDestroy() {
    if (this.html5Qrcode) {
      this.html5Qrcode.stop().catch(err => console.error("Error al detener el escáner", err));
    }
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

      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      this.eventosAprobadosOInscritos = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fechaReservada);
        const fechaEventoSinHora = new Date(fechaEvento.getFullYear(), fechaEvento.getMonth(), fechaEvento.getDate());
        return ((evento.espera && evento.idAlumno === this.idAlumno) ||
                evento.participantesActuales?.includes(this.idAlumno)) &&
                fechaEventoSinHora >= hoy;
      });

      this.eventosEnEspera = eventos.filter(evento => {
        const fechaEvento = new Date(evento.fechaReservada);
        const fechaEventoSinHora = new Date(fechaEvento.getFullYear(), fechaEvento.getMonth(), fechaEvento.getDate());
        return !evento.espera && evento.idAlumno === this.idAlumno &&
               fechaEventoSinHora >= hoy;
      });
    });
  }

  loadEventosAdmin(): void {
    this.eventoAdminService.getEventos().subscribe((eventosAdmin) => {
      if (!this.idAlumno) return;

      const ahora = new Date();

      this.eventosAdminInscritos = eventosAdmin.filter(eventoAdmin =>
        eventoAdmin.participants.some(part => part.idAlumno === this.idAlumno) &&
        eventoAdmin.status === true &&
        new Date(eventoAdmin.fechaReservada) >= ahora
      );
    });
  }

  configurarDesafio(evento: eventos) {
    this.router.navigate(['/desafio'], { queryParams: { evento: JSON.stringify(evento) } });
  }

  async eliminarEvento(evento: eventos | eventosAdmin) {
    if (this.esEventoAlumno(evento) && evento.idAlumno === this.idAlumno) {
      const alert = await this.alertController.create({
        header: 'Cancelar evento',
        message: '¿Estás seguro de que deseas cancelar el evento? Esta acción no se puede deshacer.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación de evento cancelada por el usuario.');
            }
          },
          {
            text: 'Confirmar',
            handler: () => {
              const idEvento = (evento as eventos).idEventosAlumnos;
              this.eventosService.deleteEvento(idEvento).then(
                () => {
                  console.log(`Evento ${idEvento} eliminado exitosamente.`);
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

  // Método para identificar si el evento es del tipo eventos
  esEventoAlumno(evento: eventos | eventosAdmin): evento is eventos {
    return (evento as eventos).idAlumno !== undefined;
  }

  iniciarEscaneo() {
    const readerElement = document.getElementById("reader");
    if (!readerElement) {
      console.error("El elemento 'reader' no se encuentra en el DOM.");
      return;
    }

    if (!this.html5Qrcode) {
      this.html5Qrcode = new Html5Qrcode("reader");
      console.log("html5Qrcode inicializado:", this.html5Qrcode);
    }

    const config = {
      fps: 10,
      qrbox: 250
    };

    this.html5Qrcode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        console.log(`Código QR detectado: ${decodedText}`);
        this.actualizarLlegada(decodedText);
        this.html5Qrcode?.stop().catch(err => console.error("Error al detener el escáner", err));
      },
      (errorMessage) => {
        console.warn(`Código QR no detectado: ${errorMessage}`);
      }
    ).catch(err => {
      console.error("Error al iniciar el escáner", err);
    });
  }

  actualizarLlegada(codigoQr: string) {
    let qrData;

    try {
        // Intentar parsear el JSON del código QR
        qrData = JSON.parse(codigoQr);
    } catch (error) {
        console.error('Error al parsear el código QR:', error);
        return;
    }

    // Asegurarse de que el JSON contiene un `eventoId`
    if (!qrData.eventoId) {
        console.error('El código QR no contiene un eventoId.');
        return;
    }

    // Buscar el evento en ambas listas
    const evento = this.eventosAprobadosOInscritos.find(evento => evento.idEventosAlumnos === qrData.eventoId) ||
                   this.eventosAdminInscritos.find(eventoAdmin => eventoAdmin.idEventosAdmin === qrData.eventoId);

    if (evento && this.esEventoAdmin(evento)) {
        const participante = evento.participants.find(part => part.idAlumno === this.idAlumno);

        if (participante) {
            participante.llego = true; // Cambiar `llego` a true
            this.eventoAdminService.updateEvento(evento.idEventosAdmin, { participants: evento.participants })
                .then(() => console.log(`Estado de llegada actualizado para el evento ${evento.idEventosAdmin}`))
                .catch(error => console.error('Error al actualizar el estado de llegada:', error));
        } else {
            console.error('Participante no encontrado');
        }
    } else {
        console.error('Evento no encontrado para el código QR proporcionado o no es un evento administrado.');
    }
}

  esEventoAdmin(evento: eventos | eventosAdmin): evento is eventosAdmin {
    return (evento as eventosAdmin).participants !== undefined;
  }

  async cancelarInscripcion(evento: eventos) {
    if (evento.participantesActuales?.includes(this.idAlumno!)) {
      const alert = await this.alertController.create({
        header: 'Cancelar inscripción',
        message: '¿Estás seguro de que deseas cancelar tu inscripción en este evento?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: async () => {
              const index = evento.participantesActuales.indexOf(this.idAlumno!);
              if (index > -1) {
                evento.participantesActuales.splice(index, 1);
                try {
                  await this.eventosService.updateEvento(evento.idEventosAlumnos, { participantesActuales: evento.participantesActuales });
                  console.log(`Inscripción en el evento ${evento.idEventosAlumnos} cancelada exitosamente.`);
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
    const participante = evento.participants.find(p => p.idAlumno === this.idAlumno);

    if (participante) {
      const alert = await this.alertController.create({
        header: 'Cancelar inscripción',
        message: '¿Estás seguro de que deseas cancelar tu inscripción en este evento?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Confirmar',
            handler: async () => {
              const index = evento.participants.findIndex(p => p.idAlumno === this.idAlumno);

              if (index > -1) {
                evento.participants.splice(index, 1);
                try {
                  await this.eventoAdminService.updateEvento(evento.idEventosAdmin, { participants: evento.participants });
                  console.log(`Inscripción en el evento ${evento.idEventosAdmin} cancelada exitosamente.`);
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

  isParticipating(evento: eventosAdmin): boolean {
    return evento.participants.some(part => part.idAlumno === this.idAlumno);
  }
}
