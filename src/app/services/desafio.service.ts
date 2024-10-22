import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Auth, user } from '@angular/fire/auth';
import { ParticipantModel } from 'src/app/models/desafio';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-desafio',
  templateUrl: './desafio.page.html',
  styleUrls: ['./desafio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent,
    FooterComponent
  ],
})
export class DesafioPage implements OnInit {
  desafioForm: FormGroup;
  auth: Auth = inject(Auth);

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  initializeForm() {
    this.desafioForm = this.fb.group({
      type: [''],
      sport: [''],
      participants: this.fb.array([]),
      rules: this.fb.group({
        maxPoints: [''],
        maxGoals: [''],
        setsToWin: [''],
        timeLimit: ['']
      }),
      results: this.fb.group({
        winner: [''],
        finalScore: [''],
        isDraw: [false],
        summary: ['']
      })
    });

    this.cdr.detectChanges();
  }
ngOnInit() {
    this.initializeForm();

    user(this.auth).subscribe(currentUser => {
      if (currentUser) {
        const creator: ParticipantModel = {
          id: currentUser.uid,
          name: currentUser.displayName || 'Nombre del Jugador',
          score: 0
        };
        (this.desafioForm.get('participants') as FormArray).push(this.fb.group(creator));
      }
    });
  }

  onSubmit() {
    if (this.desafioForm.valid) {
      const desafio = this.desafioForm.value;

      console.log('Desafío a crear:', desafio);

      const userId = 'ID_DEL_RETADO'; // Asegúrate de reemplazar esto con el ID real del retado
      this.authService.createChallenge(userId, desafio).then(() => {
        console.log('Desafío creado');
        this.router.navigate(['/espera', { eventId: desafio.event }]); // Redirige a la página de espera con el eventId
      }).catch(error => {
        console.error('Error al crear desafío:', error);
      });
    } else {
      console.error('El formulario no es válido:', this.desafioForm.errors);
    }
  }
}