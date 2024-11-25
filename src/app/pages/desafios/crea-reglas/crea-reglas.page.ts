import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReglasModel } from 'src/app/models/reglas-evento';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

import { ReglasService } from 'src/app/services/reglas.service';
import { v4 as uuidv4 } from 'uuid';
import {
  IonInput,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRow,
  IonCol,
  IonItem,
  IonButton,
  IonToggle,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crea-reglas',
  templateUrl: './crea-reglas.page.html',
  styleUrls: ['./crea-reglas.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonItem,
    IonCol,
    IonRow,
    IonContent,
    IonLabel,
    IonInput,
    IonToggle,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    FooterComponent,
    HeaderComponent,
    CommonModule
  ],
})
export class CreaReglasPage implements OnInit {
  reglasForm: FormGroup;
  botonConfigurarDesafioDisabled = false;

  // Valores para puntos de victoria
  puntos: number[] = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private reglasService: ReglasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Inicialización del formulario
    this.reglasForm = this.fb.group({
      pointsToWin: [null, Validators.required], // Campo requerido
      reglasAdicionales: [''], // Campo opcional
      esPorEquipos: [false], // Valor booleano predeterminado
    });
  }

  async guardarReglas() {
    if (this.reglasForm.valid) {
      const reglasData = this.reglasForm.value;
      const currentUser = await this.authService.getCurrentUserAsync();
      const userId = currentUser?.uid;

      if (userId) {
        const newReglas: ReglasModel = {
          id: uuidv4(),
          creatorId: userId,
          eventId: this.route.snapshot.queryParams['eventoId'] || null,
          ...reglasData,
        };

        try {
          await this.reglasService.createReglas(newReglas);
          console.log('Reglas guardadas:', newReglas);
          this.reglasForm.disable(); // Deshabilita el formulario para evitar ediciones
          this.botonConfigurarDesafioDisabled = true; // Deshabilita el botón
          this.router.navigate(['/evento-list'], {
            queryParams: { eventId: newReglas.eventId },
          });
        } catch (error) {
          console.error('Error guardando las reglas:', error);
        }
      }
    } else {
      console.error('El formulario no es válido:', this.reglasForm.errors);
    }
  }
}
