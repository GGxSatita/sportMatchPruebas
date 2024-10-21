import { Component, OnInit } from '@angular/core';
import { eventos } from 'src/app/models/evento';
import { EventosService } from 'src/app/services/evento.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { Sectores, Horario } from 'src/app/models/sector';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { AlertController } from '@ionic/angular';
import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { eventosAdmin } from 'src/app/models/evento-admin';


import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonTextarea,
  IonButtons,
  IonImg,
  IonItemDivider
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evento-add',
  templateUrl: './evento-add.page.html',
  styleUrls: ['./evento-add.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, IonContent, IonHeader, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonButton, IonTextarea, IonList, IonItemDivider, IonThumbnail, IonButtons, IonImg]
})
export class EventoAddPage implements OnInit {

  eventosAdmin: eventosAdmin[] = [];
  step: number = 1;
  sectores: Sectores[] = [];
  horariosDisponibles: Horario[] = [];
  selectedDate: string | null = null;
  selectedSectorId: string | null = null;
  selectedSectorImage: string | null = null;
  selectedHorario: Horario | null = null;
  eventos: eventos[] = [];
  newEvento: eventos = new eventos();
  minDate: string;
  maxDate: string;

  idAlumno: string | null = null;

  constructor(
    private eventosService: EventosService,
    private sectoresService: SectoresService,
    private auth: Auth,
    private router: Router,
    private alertController : AlertController,
    private eventoAdminService: EventoAdminService,
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
  }

  nextStep(): void {
    this.step++;
  }

  previousStep(): void {
    this.step--;
  }

  ngOnInit(): void {
    this.loadSectores();
    this.loadEventos();
    this.loadAlumnoId();
    this.loadEventosAdmin();
  }

  loadEventosAdmin(): void {
    this.eventoAdminService.getEventos().subscribe((eventosAdmin) => {
      this.eventosAdmin = eventosAdmin;
      console.log('Eventos del administrador cargados:', this.eventosAdmin);
      this.filterHorarios(); // Aseguramos que los horarios se filtren después de cargar eventos de administrador
    });
  }

  async loadAlumnoId() {
    const user = this.auth.currentUser;
    if (user) {
      this.idAlumno = user.uid;
    } else {
      console.error('No hay usuario autenticado.');
    }
  }

  loadSectores(): void {
    this.sectoresService.getSectores().subscribe((sectores) => {
      // Asegurar que 'visible' siempre sea booleano
      this.sectores = sectores.map(sector => ({
        ...sector,
        visible: sector.visible === true // Convertimos a booleano si es necesario
      }));
      console.log('Sectores después de la conversión:', this.sectores); // Verificación
    });
  }



  loadEventos(): void {
    this.eventosService.getEventos().subscribe((eventos) => {
      this.eventos = eventos;
      console.log('Eventos cargados:', this.eventos);
      this.filterHorarios(); // Asegurar que los horarios se filtren después de cargar eventos
    });

  }

  onSectorChange(event: any): void {
    this.selectedSectorId = event.detail.value;
    const sector = this.sectores.find(s => s.idSector === this.selectedSectorId);
    this.selectedSectorImage = sector?.image || null;
    this.filterHorarios();
  }

  onDateChange(): void {
    this.filterHorarios();
  }

  filterHorarios(): void {
    if (this.selectedSectorId && this.selectedDate) {
      const sector = this.sectores.find(s => s.idSector === this.selectedSectorId);
      const dayOfWeek = this.getDayOfWeek(this.selectedDate);

      if (sector) {
        this.horariosDisponibles = sector.horarios.map(horario => {
          const isSameDayOfWeek = this.normalizeDayName(horario.dia) === dayOfWeek;

          // Verificar si el horario está ocupado en 'eventos'
          const eventoBloqueado = this.eventos.some(evento => {
            const coincideSector = evento.idSector === this.selectedSectorId;
            const coincideFecha = this.compararFechas(evento.fechaReservada, this.selectedDate);
            const coincideHora = evento.hora === `${horario.inicio} - ${horario.fin}`;
            return coincideSector && coincideFecha && coincideHora;
          });

          // Verificar si el horario está ocupado en 'eventosAdmin'
          const eventoAdminBloqueado = this.eventosAdmin.some(eventoAdmin => {
            const coincideSector = eventoAdmin.idSector === this.selectedSectorId;
            const coincideFecha = this.compararFechas(eventoAdmin.fechaReservada, this.selectedDate);
            const coincideHora = eventoAdmin.hora === `${horario.inicio} - ${horario.fin}`;
            return coincideSector && coincideFecha && coincideHora;
          });

          // Determinar si el horario está disponible
          const disponible = isSameDayOfWeek && !eventoBloqueado && !eventoAdminBloqueado;

          // Log para depurar
          console.log(`Horario: ${horario.inicio} - ${horario.fin}, Disponible: ${disponible}`);

          return { ...horario, disponible };
        }).filter(horario => this.normalizeDayName(horario.dia) === dayOfWeek);
      }
    }
  }





  // Función para comparar fechas sin horas
  compararFechas(fecha1: string, fecha2: string): boolean {
    // Convertimos ambas fechas a formato YYYY-MM-DD para asegurarnos de que sean comparables
    const date1 = new Date(fecha1).toISOString().split('T')[0];
    const date2 = new Date(fecha2).toISOString().split('T')[0];
    return date1 === date2;
  }





  getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return this.normalizeDayName(days[date.getDay()]);
  }

  normalizeDayName(day: string): string {
    return day.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  selectHorario(horario: Horario): void {
    this.selectedHorario = horario;
    this.newEvento.hora = `${horario.inicio} - ${horario.fin}`;
  }

  onTitleChange(event: any): void {
    this.newEvento.titulo = event.detail.value;
    console.log('Título actualizado:', this.newEvento.titulo); // Depuración
  }

  onCapacityChange(event: any): void {
    this.newEvento.capacidadMaxima = event.detail.value;
    console.log('Capacidad Máxima:', this.newEvento.capacidadMaxima); // Depuración
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.selectedHorario && this.selectedDate && this.selectedSectorId) {
      const sector = this.sectores.find(s => s.idSector === this.selectedSectorId);

      if (!sector) {
        this.presentAlert('Error', 'Sector no encontrado.');
        return;
      }

      const enEspera = sector.visible === true;

      // Extraer solo la fecha en formato YYYY-MM-DD
      const fechaReservada = this.formatDate(this.selectedDate);

      // Determinamos el valor del status en función de tus reglas de negocio
      const status = !enEspera; // Si está en espera, el horario está bloqueado (status = false)

      const nuevoEvento: eventos = {
        ...this.newEvento,
        idSector: this.selectedSectorId,
        espera: enEspera,
        image: this.selectedSectorImage || '',
        fechaReservada: fechaReservada, // Guardar solo la fecha
        sectorNombre: this.getSectorNombre(this.selectedSectorId),
        hora: this.newEvento.hora,
        idAlumno: this.idAlumno,
        capacidadMaxima: this.newEvento.capacidadMaxima,
        participantesActuales: [],
        informacionAdicional: this.newEvento.informacionAdicional || '',
        status: status // Asignamos el valor de status aquí
      };

      console.log('Evento a guardar:', nuevoEvento);

      this.eventosService.createEvento(nuevoEvento).then(() => {
        const message = enEspera
          ? 'El evento ha sido creado y está en espera de confirmación.'
          : 'Evento creado exitosamente y hora bloqueada.';
        this.presentAlert('Éxito', message);
        this.resetForm();
        this.loadEventos();

        // Redirigir a la página eventos-list después de crear el evento
        this.router.navigate(['/evento-list']);
      }).catch(error => {
        console.error('Error al crear el evento:', error);
        this.presentAlert('Error', 'Ocurrió un error al crear el evento.');
      });
    }
  }



  //ALEEEERTAAAAA
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }



  resetForm(): void {
    this.newEvento = new eventos();
    this.selectedHorario = null;
    this.selectedDate = null;
    this.selectedSectorId = null;
    this.selectedSectorImage = null;
  }

  getSectorNombre(sectorId: string): string {
    return this.sectores.find(s => s.idSector === sectorId)?.nombre || 'Desconocido';
  }



}
