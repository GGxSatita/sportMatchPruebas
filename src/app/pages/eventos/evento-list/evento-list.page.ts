import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  chevronDownCircle,
  chevronForwardCircle,
  chevronUpCircle,
  colorPalette,
  document,
  globe,
} from 'ionicons/icons';
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { EventosService } from 'src/app/services/evento.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { eventos } from 'src/app/models/evento';
import { Sectores, Horario } from 'src/app/models/sector';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.page.html',
  styleUrls: ['./evento-list.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
  imports: [
    CommonModule,
    FormsModule,
    IonFab,        // Ensure you import all necessary Ionic components
    IonFabButton,
    IonFabList,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    HeaderComponent,
    FooterComponent,
  ],
})
export class EventoListPage implements OnInit {

  sectores: Sectores[] = [];
  horariosDisponibles: Horario[] = [];
  selectedDate: string | null = null;
  selectedSectorId: string | null = null;
  selectedSectorImage: string | null = null;
  selectedHorario: Horario | null = null;
  eventos: eventos[] = [];
  minDate: string;
  maxDate: string;

  eventosFiltrados: eventos[] = []; // Eventos que se mostrarán filtrados
  idAlumno: string | null = null;   // ID del alumno autenticado

  constructor(
    private eventosService: EventosService,
    private sectoresService: SectoresService,
    private router: Router,
    private auth: Auth,
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSectores();
    this.loadEventos();
    this.obtenerAlumnoId();
  }


  loadEventos(): void {
    this.eventosService.getEventos().subscribe((eventos) => {
      this.eventos = eventos;
      this.filtrarEventos(); // Filtrar los eventos después de cargarlos
    });
  }

  filtrarEventos(): void {
    this.eventosFiltrados = this.eventos.filter(evento =>
      evento.espera || evento.idAlumno === this.idAlumno
    );
  }



  async obtenerAlumnoId() {
    const user = this.auth.currentUser;
    if (user) {
      this.idAlumno = user.uid;
      this.loadEventos(); // Cargar eventos después de obtener el ID del alumno
    } else {
      console.error('No hay usuario autenticado.');
    }
  }
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  loadSectores(): void {
    this.sectoresService.getSectores().subscribe((sectores) => {
      this.sectores = sectores;
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
    return day.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }



  filterHorarios(): void {
    if (this.selectedSectorId && this.selectedDate) {
      const selectedSector = this.sectores.find(sector => sector.idSector === this.selectedSectorId);
      const dayOfWeek = this.getDayOfWeek(this.selectedDate);

      if (selectedSector) {
        this.horariosDisponibles = selectedSector.horarios.map(horario => {
          const isSameDayOfWeek = this.normalizeDayName(horario.dia) === dayOfWeek;
          const isReserved = horario.fechasReservadas?.includes(this.selectedDate) || false;
          return { ...horario, disponible: isSameDayOfWeek && !isReserved };
        }).filter(horario => horario.dia === dayOfWeek);
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
  }

  onSubmit(): void {
    if (this.selectedHorario && this.selectedDate && this.selectedSectorId) {
      const nuevoEvento: eventos = {
        idEventosAlumnos: '',
        idSector: this.selectedSectorId,
        titulo: 'Nuevo Evento',
        descripcion: `Evento en ${this.selectedHorario.dia} de ${this.selectedHorario.inicio} a ${this.selectedHorario.fin}`,
        espera: false,
        image: this.selectedSectorImage || '',
        fechaReservada: this.selectedDate,
        sectorNombre: this.getSectorNombre(this.selectedSectorId),
        capacidadAlumnos: 0
      };

      this.eventosService.createEvento(nuevoEvento).then(() => {
        alert('Evento creado exitosamente.');
        this.loadEventos();
      });
    }
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
