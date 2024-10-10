import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonThumbnail, IonLabel, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { eventos } from 'src/app/models/evento';
import { EventoService } from 'src/app/services/evento.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.page.html',
  styleUrls: ['./evento-list.page.scss'],
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
    IonCard, // Importa IonCard
    IonCardHeader, // Importa IonCardHeader
    IonCardTitle, // Importa IonCardTitle
    IonCardSubtitle, // Importa IonCardSubtitle
    IonCardContent, // Importa IonCardContent
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent
  ]
})
export class EventoListPage implements OnInit {
  eventos$: Observable<eventos[]>;

  constructor(private eventosService: EventoService) {}

  ngOnInit() {
    this.eventos$ = this.eventosService.getEventos();
  }
}
