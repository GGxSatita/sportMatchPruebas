import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone';
import { DesafioService } from 'src/app/services/desafio.service';

@Component({
  selector: 'app-desafio',
  templateUrl: './desafio.page.html',
  styleUrls: ['./desafio.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonSelect, IonSelectOption]
})
export class DesafioPage implements OnInit {

desafioForm: any;

  constructor(private fb: FormBuilder, private desafiosService: DesafioService) { }

  ngOnInit() {
    this.desafioForm = this.fb.group({
      name: [''],
      type: [''],
      sport: [''],
      participants: this.fb.array([]),
      rules: this.fb.group({
        maxPoints: [''],
        maxGoals: [''],
        setsToWin: [''],
        timeLimit: ['']
      }),
      event: [''],
      results: this.fb.group({
        winner: [''],
        finalScore: [''],
        isDraw: [false],
        summary: ['']
      })
    });
  }
  onSubmit() {
    if (this.desafioForm.valid) {
      this.desafiosService.createDesafio(this.desafioForm.value).then(() => {
        console.log('Desafío creado');
      }).catch(error => {
        console.error('Error al crear desafío:', error);
      });
    }
  }
}
