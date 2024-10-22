import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DesafioService } from 'src/app/services/desafio.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-enfrentamiento',
  templateUrl: './enfrentamiento.page.html',
  styleUrls: ['./enfrentamiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class EnfrentamientoPage {
  enfrentamientoForm: FormGroup;
  maxPointsAchieved = 0;
  maxGoalsAchieved = 0;
  maxPoints = 10; // Valor inicial según el desafío
  maxGoals = 3; // Valor inicial según el desafío
  totalScore = 0;

  constructor(private fb: FormBuilder, private desafioService: DesafioService) {
    this.enfrentamientoForm = this.fb.group({
      // Agrega los controles del formulario necesarios
    });
  }

  // Función para manejar la victoria
  victory() {
    this.maxGoalsAchieved += 1;
    this.totalScore += this.maxPointsAchieved * 10;

    if (this.maxGoalsAchieved >= this.maxGoals) {
      // Lógica para manejar la victoria total
      console.log('Victoria total lograda');
      // Puedes añadir más lógica aquí, como actualizar el estado del desafío
    }
  }

  // Función para manejar la derrota
  defeat() {
    // Lógica para manejar la derrota
    console.log('Derrota');
    // Puedes añadir más lógica aquí, como actualizar el estado del desafío
  }
}
