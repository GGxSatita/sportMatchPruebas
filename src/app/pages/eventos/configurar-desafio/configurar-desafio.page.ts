import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular'; // Importamos IonicModule
import { DesafioService } from 'src/app/services/desafio.service';
import { eventos } from 'src/app/models/evento';
import { Desafio } from 'src/app/models/desafio';

@Component({
  selector: 'app-configurar-desafio',
  templateUrl: './configurar-desafio.page.html',
  styleUrls: ['./configurar-desafio.page.scss'],
  standalone: true, // Componente independiente (standalone)
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Permite el uso de Web Components
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // Importamos todo IonicModule aquí
  ],
})
export class ConfigurarDesafioPage implements OnInit {
  evento: eventos | null = null;
  desafio: Desafio = {
    id: '',
    name: '',
    type: 'PUNTOS',
    sport: 'FUTBOL',
    status: 'PENDIENTE',
    startTime: null,
    endTime: null,
    participants: [],
    rules: {},
    event: new eventos(),
  };

  constructor(
    private route: ActivatedRoute,
    private desafioService: DesafioService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const eventoId = this.route.snapshot.paramMap.get('id');
    if (eventoId) {
      this.cargarEvento(eventoId);
    }
  }

  cargarEvento(id: string) {
    console.log('Cargando evento con ID:', id);
    // Aquí puedes cargar más información sobre el evento si es necesario.
  }

  async guardarDesafio() {
    try {
      await this.desafioService.createDesafio(this.desafio);
      const toast = await this.toastController.create({
        message: 'Desafío configurado exitosamente.',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (error) {
      console.error('Error al guardar el desafío:', error);
      const toast = await this.toastController.create({
        message: 'Error al configurar el desafío.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }
}
