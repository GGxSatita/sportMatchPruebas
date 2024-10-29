import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonItem, IonList, IonLabel, IonContent, IonAvatar,
  IonGrid, IonCol, IonRow, IonHeader, IonToolbar, IonButtons, IonTitle
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { EventoAdminService } from 'src/app/services/evento-admin.service';
import { eventosAdmin } from 'src/app/models/evento-admin';
import { ClubesService } from 'src/app/services/clubes.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Noticias } from 'src/app/models/noticias';
import { NoticiasService } from 'src/app/services/noticias.service';
import { Timestamp } from 'firebase/firestore';
import { NoticiasComponent } from 'src/app/components/noticias/noticias.component';

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonList,
    IonLabel,
    IonContent,
    IonAvatar,
    IonGrid,
    IonCol,
    IonRow,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    HeaderComponent,
    FooterComponent,
    NoticiasComponent,
    SwiperModule,
  ],
})
export class MenuPrincipalPage implements OnInit {
  @ViewChild('swiperRef') swiperRef!: SwiperComponent; // Referencia al Swiper

  eventos: eventosAdmin[] = [];
  alumnoId: string = '';
  notificaciones: any[] = [];
  noticias: Noticias[] = [];

  swiperConfig: SwiperOptions = {
    autoplay: {
      delay: 3000, // Cambia cada 3 segundos
      disableOnInteraction: false, // Permitir que la navegación manual no detenga el autoplay
    },
    pagination: {
      el: '.swiper-pagination', // Asegúrate de que esto esté bien configurado
      clickable: true,
    },
    loop: true, // Habilitar el loop para que el swiper reinicie
  };

  constructor(
    private autenticacionService: AutenticacionService,
    private clubesService: ClubesService,
    private router: Router,
    private alertController: AlertController,
    private eventoAdminService: EventoAdminService,
    private notificacionesService: NotificacionesService,
    private noticiasService: NoticiasService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarNoticias();

    try {
      const user = await this.autenticacionService.getCurrentUser();
      if (user) {
        this.alumnoId = user.uid;

        this.notificacionesService.getNotificacionesUsuario().subscribe((notificaciones) => {
          this.notificaciones = notificaciones;
        });

      }

      // Obtener eventos activos
      this.eventoAdminService.getEventos().subscribe((eventos) => {
        const today = new Date().toISOString().split('T')[0];
        this.eventos = eventos.filter((evento) =>
          evento.status === true && new Date(evento.fechaReservada).toISOString().split('T')[0] >= today
        );
      });
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
    }
  }

  cargarNoticias() {
    this.noticiasService.getNoticias().subscribe((noticias: Noticias[]) => {
      this.noticias = noticias.map(noticia => {
        return {
          ...noticia,
          fecha: noticia.fecha instanceof Timestamp ? noticia.fecha.toDate() : noticia.fecha // Convertir Timestamp a Date
        };
      });
    });
  }

  toggleDetails(noticia: Noticias) {
    noticia.showDetails = !noticia.showDetails;
  }

  async unirseAlEvento(eventoId: string) {
    try {
      const evento = this.eventos.find((e) => e.idEventosAdmin === eventoId);
      if (evento) {
        if (evento.participants.length >= evento.capacidadAlumnos) {
          console.log('Este evento ya ha alcanzado su capacidad máxima.');
          return;
        }
        await this.eventoAdminService.joinEvento(eventoId, this.alumnoId);
        evento.participants.push({ idAlumno: this.alumnoId, llego: false });
        console.log('Te has unido al evento.');
      } else {
        console.error('Evento no encontrado.');
      }
    } catch (error) {
      console.error('No se pudo unir al evento:', error);
    }
  }

  estaLlenoOUnido(evento: eventosAdmin): boolean {
    return (
      evento.participants.length >= evento.capacidadAlumnos ||
      evento.participants.some(p => p.idAlumno === this.alumnoId)
    );
  }


}
