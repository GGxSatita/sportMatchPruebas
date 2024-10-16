import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonItemDivider,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { DesafioService } from 'src/app/services/desafio.service';
import { Auth, User } from '@angular/fire/auth';
import { Desafio } from 'src/app/models/desafio';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-desafio-alumno',
  templateUrl: './desafio-alumno.page.html',
  styleUrls: ['./desafio-alumno.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Permite elementos personalizados
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonItemDivider,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    HeaderComponent,
    FooterComponent,
  ],
})
export class DesafioAlumnoPage implements OnInit {
  desafiosInscritos: Desafio[] = [];
  idAlumno: string | null = null;
  desafioActual: Desafio | null = null;

  constructor(
    private desafioService: DesafioService,
    private auth: Auth,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadAlumnoId();

    const desafioId = this.route.snapshot.paramMap.get('id');
    console.log('Desafío ID:', desafioId); // Verificar si el ID es correcto

    if (desafioId) {
      this.loadDesafioById(desafioId);
    }
  }

  async loadAlumnoId() {
    const user = await this.auth.currentUser;
    if (user) {
      this.idAlumno = user.uid;
      this.loadDesafios();
    } else {
      this.showToast('No se pudo cargar el ID del alumno.', 'danger');
    }
  }

  loadDesafios() {
    this.desafioService.getDesafios().pipe(
      switchMap((desafios) =>
        of(
          desafios.filter((desafio) =>
            desafio.participants.some((p) => p.id === this.idAlumno)
          )
        )
      ),
      catchError((error) => {
        console.error('Error al cargar desafíos:', error);
        this.showToast('Error al cargar desafíos.', 'danger');
        return of([]);
      })
    ).subscribe((desafios) => {
      this.desafiosInscritos = desafios;
    });
  }

  loadDesafioById(id: string) {
    this.desafioService.getDesafioById(id).pipe(
      catchError((error) => {
        console.error('Error al cargar el desafío:', error);
        this.showToast('Error al cargar el desafío.', 'danger');
        return of(null);
      })
    ).subscribe((desafio) => {
      this.desafioActual = desafio;
    });
  }

  iniciarDesafio(desafio: Desafio | null) {
    if (!desafio) return;

    console.log('Iniciando desafío:', desafio);
    desafio.status = 'EN_PROGRESO';

    this.desafioService
      .updateDesafio(desafio.id, { status: 'EN_PROGRESO' })
      .then(() => {
        console.log('Desafío iniciado.');
        this.desafioActual = desafio; // Cambiar a la vista de configuración del desafío
        this.showToast('Desafío iniciado correctamente.', 'success');
      })
      .catch((error) => {
        console.error('Error al iniciar el desafío:', error);
        this.showToast('Error al iniciar el desafío.', 'danger');
      });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
