import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  selector: 'app-evento-add',
  templateUrl: './evento-add.page.html',
  styleUrls: ['./evento-add.page.scss'],
  standalone: true,
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
    });
  }

  onSectorChange(event: any): void {
    this.selectedSectorId = event.detail.value;
    const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);

    if (selectedSector) {
      this.selectedSectorImage = selectedSector.image || null;
      this.filterHorarios();
    }
  }


  onDateChange(): void {
    this.filterHorarios();
  }

  normalizeDayName(day: string): string {
    return day.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  filterHorarios(): void {
    if (this.selectedSectorId && this.selectedDate) {
      const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);
      const dayOfWeek = this.normalizeDayName(this.getDayOfWeek(this.selectedDate));

      if (selectedSector) {
        this.horariosDisponibles = selectedSector.horarios.filter(horario => {
          const isSameDayOfWeek = this.normalizeDayName(horario.dia) === dayOfWeek;
          let isDateReserved = false;
          if (this.selectedDate) {
            isDateReserved = horario.fechasReservadas?.includes(this.selectedDate) || false;
          }
          horario.disponible = !isDateReserved;
          return isSameDayOfWeek;
        });
      }
    }
  }

  getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return this.normalizeDayName(days[date.getDay()]);
  }

  selectHorario(horario: Horario): void {
    this.selectedHorario = horario;
    this.newEvento.hora = `${horario.inicio} - ${horario.fin}`;
  }


  onSubmit(): void {
    if (this.selectedHorario && this.selectedDate && this.selectedSectorId) {
      const nuevoEvento: eventos = {
        ...this.newEvento,
        idSector: this.selectedSectorId,
        espera: false,
        image: this.selectedSectorImage || '',
        fechaReservada: this.selectedDate,
        sectorNombre: this.getSectorNombre(this.selectedSectorId),
        capacidadAlumnos: this.newEvento.capacidadAlumnos || 0, // Valor predeterminado
        hora: this.newEvento.hora // Incluye el horario seleccionado
      };

      this.eventosService.createEvento(nuevoEvento).then(() => {
        alert('Evento creado exitosamente.');
        this.loadEventos();
        this.resetForm();
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

  removeReservation(evento: eventos): void {
    this.eventosService.deleteEvento(evento.idEventosAlumnos).then(() => {
      alert('Reserva eliminada.');
      this.loadEventos();
    });
  }

  getSectorNombre(sectorId: string): string {
    const sector = this.sectores.find(s => s.idSector === sectorId);
    return sector ? sector.nombre : 'Sector no encontrado';
  }
}
