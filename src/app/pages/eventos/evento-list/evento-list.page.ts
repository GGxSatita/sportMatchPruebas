import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { eventos } from 'src/app/models/evento';
import { EventosService } from 'src/app/services/evento.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { Sectores } from 'src/app/models/sector';
import { Horario } from 'src/app/models/sector';
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
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonToggle,
  IonTextarea,
  IonModal,
  IonButtons,
  IonImg,
  IonItemDivider
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.page.html',
  styleUrls: ['./evento-list.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
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
    IonCardSubtitle,
    IonCardContent,
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonToggle,
    IonTextarea,
    IonModal,
    IonButtons,
    IonImg,
    IonItemDivider
  ]
})
export class EventoListPage implements OnInit {
  selectedEvento: any = null;
  sectores: Sectores[] = [];
  horariosDisponibles: Horario[] = [];
  newEvento: eventos = new eventos('', '', '', '', false, '', '', '', 0);
  selectedHorario: Horario | null = null;
  selectedDate: string | null = null;
  selectedSectorId: string | null = null;
  availableDays: Set<string> = new Set();
  minDate: string;
  maxDate: string;
  currentStep: number = 1;
  eventos: eventos[] = [];
  isEditing: boolean = false;
  eventoEditando: eventos | null = null;
  selectedSectorImage: string | null = null;

  constructor(
    private eventosService: EventosService,
    private sectoresService: SectoresService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
    this.maxDate = nextYear.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSectores();
    this.sectoresService.getSectores().subscribe(sectores => {
      this.sectores = sectores;
    });
    this.loadEvento();
  }

  loadEvento(): void {
    this.eventosService.getEventos().subscribe(eventos => {
      this.eventos = eventos;
      this.populateAvailableDays();
    });
  }

  nextStep(): void {
    if (this.canProceedToNextStep() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  loadSectores(): void {
    this.sectoresService.getSectores().subscribe(sectores => {
      this.sectores = sectores;
      this.populateAvailableDays();
    });
  }

  populateAvailableDays(): void {
    this.sectores.forEach(sector => {
      sector.horarios.forEach(horario => {
        if (horario.disponible) {
          const dayWithAvailableHours = horario.fechasReservadas || [];
          dayWithAvailableHours.forEach(fecha => {
            this.availableDays.add(fecha);
          });
        }
      });
    });
  }

  onSectorChange(event: any): void {
    this.selectedSectorId = event.target.value;
    this.filterHorarios();
    const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);
    if (selectedSector) {
      this.newEvento.sectorNombre = selectedSector.nombre;
      this.selectedSectorImage = selectedSector.image || null;
      this.newEvento.image = selectedSector.image || '';
    }
  }

  onDateChange(): void {
    if (this.selectedDate) {
      const formattedDate = new Date(this.selectedDate + 'T00:00:00');
      this.selectedDate = formattedDate.toISOString().split('T')[0];
      this.filterHorarios();
    }
  }

  filterHorarios(): void {
    if (this.selectedSectorId && this.selectedDate) {
      const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);
      const dayOfWeek = new Date(this.selectedDate).getDay();
      if (selectedSector) {
        this.horariosDisponibles = selectedSector.horarios.filter(horario => {
          const isSameDay = new Date(horario.dia).getDay() === dayOfWeek;
          const isDateReserved = horario.fechasReservadas?.includes(this.selectedDate) || false;
          return isSameDay && !isDateReserved;
        });
      }
    }
  }

  selectHorario(horario: Horario): void {
    this.selectedHorario = horario;
  }

  getSectorNombre(idSector: string): string {
    const sector = this.sectores.find(s => s.idSector === idSector);
    return sector ? sector.nombre : 'Desconocido';
  }

  onSubmit(): void {
    if (this.selectedHorario && this.selectedDate) {
      const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);
      if (selectedSector) {
        this.newEvento.sectorNombre = selectedSector.nombre;
        this.newEvento.fechaReservada = this.selectedDate;
        this.newEvento.descripcion += `\nHorario: ${this.selectedHorario?.inicio} - ${this.selectedHorario?.fin}`;
        this.eventosService.createEvento(this.newEvento).then(() => {
          alert('Evento creado exitosamente');
          this.loadEvento();
          this.resetForm();
        });
      }
    }
  }

  showDetails(evento: any): void {
    this.selectedEvento = evento;
  }

  closeDetails(): void {
    this.selectedEvento = null;
  }

  editEvent(evento: eventos): void {
    this.isEditing = true;
    this.eventoEditando = evento;
    this.newEvento = { ...evento };
    this.selectedSectorId = evento.idSector;
    this.selectedDate = evento.fechaReservada;
    this.filterHorarios();
    this.selectedHorario = this.horariosDisponibles.find(
      horario => horario.fechasReservadas?.includes(evento.fechaReservada)
    ) || null;
  }

  removeReservation(evento: any): void {
    const selectedSector = this.sectores.find(sector => sector.nombre === evento.sectorNombre);
    if (selectedSector && evento.fechaReservada) {
      const horario = selectedSector.horarios.find(h => h.fechasReservadas?.includes(evento.fechaReservada));
      if (horario && horario.fechasReservadas) {
        const index = horario.fechasReservadas.indexOf(evento.fechaReservada);
        if (index !== -1) {
          horario.fechasReservadas.splice(index, 1);
          horario.disponible = true;
          this.eventosService.deleteEvento(evento.idEventosAlumnos).then(() => {
            alert('Reserva y evento eliminados exitosamente.');
            this.loadEvento();
          });
        }
      }
    }
  }

  resetForm(): void {
    this.newEvento = new eventos('', '', '', '', false, '', '', '', 0);
    this.selectedHorario = null;
    this.horariosDisponibles = [];
    this.selectedDate = null;
    this.selectedSectorId = null;
    this.selectedSectorImage = null;
  }

  canProceedToNextStep(): boolean {
    return this.currentStep === 1
      ? !!this.newEvento.sectorNombre && !!this.selectedDate && !!this.selectedHorario
      : this.currentStep === 2
      ? !!this.newEvento.titulo && !!this.newEvento.descripcion && !!this.newEvento.creator
      : true;
  }
}
