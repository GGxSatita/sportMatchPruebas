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
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-crea-reglas',
  templateUrl: './crea-reglas.page.html',
  styleUrls: ['./crea-reglas.page.scss'],
  standalone: true,
  imports: [    IonButton,
    IonItem,
    IonCol,
    IonRow,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonLabel,
    IonInput,
    ReactiveFormsModule,]
})
export class CreaReglasPage implements OnInit {

  reglasForm: FormGroup;
  botonConfigurarDesafioDisabled = false;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private reglasService: ReglasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.reglasForm = this.fb.group({
      pointsToWin: ['', Validators.required],
      reglasAdicionales: [''],
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
          eventId: this.route.snapshot.queryParams['eventId'] || null,
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
