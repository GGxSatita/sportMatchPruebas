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
import { AlertController,ToastController } from '@ionic/angular';
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
    private toastController: ToastController
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
  //funcion para verificar aparicion de boton para unirse
  isButtonEnabled(evento: any): boolean {
    // Retorna true si el usuario es el creador o está inscrito en el evento
    return (
      evento.idAlumno === this.idAlumno ||
      evento.participantesActuales.includes(this.idAlumno)
    );
  }

  async unirseEvento(evento: any) {
    try {
      // Verificar si el evento está marcado como terminado
      const eventoTerminado = await this.eventosService.esEventoTerminado(evento.idEventosAlumnos);
      if (eventoTerminado) {
        const alert = await this.alertController.create({
          header: 'Evento terminado',
          message: 'Este evento ha finalizado y no puedes acceder.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      // Verificar si el usuario ya está inscrito
      if (evento.participantesActuales.includes(this.idAlumno)) {
        // Redirigir según el rol del usuario
        if (evento.idAlumno === this.idAlumno) {
          this.router.navigate(['/qr-creador'], {
            queryParams: { eventId: evento.idEventosAlumnos },
          });
        } else {
          this.router.navigate(['/qr-usuario'], {
            queryParams: { eventId: evento.idEventosAlumnos },
          });
        }
        return; // Salimos aquí porque ya está inscrito y no necesitamos continuar.
      }

      // Verificar si hay espacio disponible en el evento
      if (evento.participantesActuales.length >= evento.capacidadMaxima) {
        const toast = await this.toastController.create({
          message: 'El evento ha alcanzado el límite de participantes.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
        return;
      }

      // Confirmación antes de unirse al evento
      const alert = await this.alertController.create({
        header: 'Unirse al evento',
        message: `¿Estás seguro de que deseas unirte a "${evento.titulo}"?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Unirse',
            handler: async () => {
              // Lógica para unirse al evento (agregar el ID del usuario a la lista de participantes)
              evento.participantesActuales.push(this.idAlumno);

              try {
                await this.eventosService.updateEvento(evento.idEventosAlumnos, {
                  participantesActuales: evento.participantesActuales,
                });

                // Muestra un mensaje de éxito
                const toast = await this.toastController.create({
                  message: 'Te has unido al evento exitosamente.',
                  duration: 2000,
                  color: 'success',
                });
                await toast.present();

                // Redirigir según el rol del usuario
                if (evento.idAlumno === this.idAlumno) {
                  this.router.navigate(['/qr-creador'], {
                    queryParams: { eventId: evento.idEventosAlumnos },
                  });
                } else {
                  this.router.navigate(['/qr-usuario'], {
                    queryParams: { eventId: evento.idEventosAlumnos },
                  });
                }
              } catch (error) {
                console.error('Error al unirse al evento:', error);
                const errorToast = await this.toastController.create({
                  message: 'Hubo un error al intentar unirte al evento.',
                  duration: 2000,
                  color: 'danger',
                });
                await errorToast.present();
              }
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Error verificando el estado del evento:', error);
      const errorToast = await this.toastController.create({
        message: 'Hubo un error al verificar el estado del evento.',
        duration: 2000,
        color: 'danger',
      });
      await errorToast.present();
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
        message: `¿Estás seguro de que deseas cancelar el evento? Esta acción no se puede deshacer.`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación de evento cancelada por el usuario.');
            },
          },
          {
            text: 'Cancelar',
            handler: () => {
              const idEvento = evento.idEventosAlumnos;
              this.eventosService
                .deleteEvento(idEvento)
                .then(() => {
                  console.log(`Evento ${idEvento} eliminado exitosamente.`);
                  // Actualizamos la lista de eventos después de eliminar
                  this.loadEventos();
                })
                .catch((error: any) => {
                  console.error('Error al eliminar el evento:', error);
                });
            },
          },
        ],
      });

      await alert.present();
    } else {
      console.error('No tienes permiso para eliminar este evento.');
    }
  }


  getDisponibilidad(evento: eventos): string {
    return evento.espera ? 'Disponible' : 'No Disponible';
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



  esEventoAdmin(evento: eventos | eventosAdmin): evento is eventosAdmin {
    return (evento as eventosAdmin).participants !== undefined;
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

  hasArrived(evento: eventosAdmin): boolean {
    const participante = evento.participants.find(part => part.idAlumno === this.idAlumno);
    return participante ? participante.llego : false;
}


actualizarLlegada(codigoQr: string) {
  let qrData;

  try {
      qrData = JSON.parse(codigoQr);
  } catch (error) {
      console.error('Error al parsear el código QR:', error);
      return;
  }

  if (!qrData.eventoId) {
      console.error('El código QR no contiene un eventoId.');
      return;
  }

  const evento = this.eventosAprobadosOInscritos.find(evento => evento.idEventosAlumnos === qrData.eventoId) ||
                 this.eventosAdminInscritos.find(eventoAdmin => eventoAdmin.idEventosAdmin === qrData.eventoId);

  if (evento && this.esEventoAdmin(evento)) {
      const participante = evento.participants.find(part => part.idAlumno === this.idAlumno);

      if (participante) {
          participante.llego = true;
          this.eventoAdminService.updateEvento(evento.idEventosAdmin, { participants: evento.participants })
              .then(() => {
                  console.log(`Estado de llegada actualizado para el evento ${evento.idEventosAdmin}`);
                  // Refrescar el estado de la interfaz para reflejar "Registrado"
                  this.loadEventosAdmin();  // Opcional: puedes llamar a esta función si necesitas refrescar la lista completa
              })
              .catch(error => console.error('Error al actualizar el estado de llegada:', error));
      } else {
          console.error('Participante no encontrado');
      }
  } else {
      console.error('Evento no encontrado para el código QR proporcionado o no es un evento administrado.');
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
          },
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
                await this.eventosService.updateEvento(evento.idEventosAlumnos, {
                  participantesActuales: evento.participantesActuales
                });

                // Eliminar el usuario de la lista de asistencia en Firestore
                evento.asistencia = evento.asistencia.filter(
                  (asistencia) => asistencia.idAlumno !== this.idAlumno
                );

                await this.eventosService.updateEvento(evento.idEventosAlumnos, {
                  asistencia: evento.asistencia
                });

                console.log(
                  `Inscripción en el evento ${evento.idEventosAlumnos} cancelada exitosamente.`
                );

                // Actualizamos la lista de eventos después de cancelar la inscripción
                this.loadEventos();
              } catch (error) {
                console.error('Error al cancelar la inscripción en el evento:', error);
              }
            }
          },
        },
      ],
    });

    await alert.present();
  } else {
    console.error('No estás inscrito en este evento o no se permite cancelar la inscripción.');
  }
}

}
