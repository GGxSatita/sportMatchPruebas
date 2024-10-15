import { Component, OnInit } from '@angular/core';
import { eventos } from 'src/app/models/evento';
import { EventosService } from 'src/app/services/evento.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { Sectores, Horario } from 'src/app/models/sector';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonSpinner,
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
  IonModal,
  IonButtons,
  IonImg,
  IonItemDivider
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-evento-add',
  templateUrl: './evento-add.page.html',
  styleUrls: ['./evento-add.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonTextarea,
    IonList,
    IonItemDivider,
    IonThumbnail,
    IonButtons,
    IonImg
  ]
})
export class EventoAddPage implements OnInit {
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

  constructor(
    private eventosService: EventosService,
    private sectoresService: SectoresService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSectores();
    this.loadEventos();
  }

  loadSectores(): void {
    this.sectoresService.getSectores().subscribe((sectores) => {
      this.sectores = sectores;
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

          // Verificamos si hay un evento aprobado (espera: false) que bloquee el horario
          const eventoBloqueado = this.eventos.some(evento => {
            const coincideSector = evento.idSector === this.selectedSectorId;
            const coincideFecha = this.compararFechas(evento.fechaReservada, this.selectedDate);
            const coincideHora = evento.hora === `${horario.inicio} - ${horario.fin}`;

            // La hora solo debe estar ocupada si el evento fue aprobado (espera: false)
            const estaAprobado = evento.espera === true;

            console.log(`Verificando evento: ${evento.titulo}, Aprobado: ${estaAprobado}`);

            return coincideSector && coincideFecha && coincideHora && estaAprobado;
          });

          // El horario estará disponible si no hay eventos aprobados para esa hora
          return { ...horario, disponible: isSameDayOfWeek && !eventoBloqueado };
        }).filter(horario => this.normalizeDayName(horario.dia) === dayOfWeek);
      }
    }
  }

  // Función para comparar fechas sin horas
  compararFechas(fecha1: string, fecha2: string): boolean {
    const date1 = new Date(fecha1).toDateString();
    const date2 = new Date(fecha2).toDateString();
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

  onSubmit(): void {
    if (this.selectedHorario && this.selectedDate && this.selectedSectorId) {
      const sector = this.sectores.find(s => s.idSector === this.selectedSectorId);

      // Si el sector es público (visible: true), el evento queda en espera (espera: true).
      // Si es privado (visible: false), el evento se aprueba (espera: false).
      const enEspera = sector?.visible === true;

      const nuevoEvento: eventos = {
        ...this.newEvento,
        idSector: this.selectedSectorId,
        espera: enEspera, // Asignación clara
        image: this.selectedSectorImage || '',
        fechaReservada: this.selectedDate,
        sectorNombre: this.getSectorNombre(this.selectedSectorId),
        capacidadAlumnos: this.newEvento.capacidadAlumnos || 0,
        hora: this.newEvento.hora
      };

      console.log('Evento a guardar:', nuevoEvento); // Depuración

      this.eventosService.createEvento(nuevoEvento).then(() => {
        if (enEspera) {
          alert('El evento ha sido creado y está en espera de confirmación.');
        } else {
          alert('Evento creado exitosamente y hora bloqueada.');
        }
        this.resetForm();
        this.loadEventos(); // Recargar eventos después de crear uno nuevo
      }).catch((error) => {
        console.error('Error al crear evento:', error);
        alert('Ocurrió un error al crear el evento.');
      });
    }
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
