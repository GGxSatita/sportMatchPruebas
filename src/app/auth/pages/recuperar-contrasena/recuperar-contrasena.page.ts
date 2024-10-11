import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonInput,
  IonSpinner,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  AlertController, // Importamos AlertController
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonInput,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
  ],
})
export class RecuperarContrasenaPage implements OnInit {
  resetPasswordForm: FormGroup;
  mensaje: string;
  cargando: boolean = false; // Indicador de carga

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router,
    private alertController: AlertController // Inyectamos AlertController
  ) {}

  ngOnInit() {
    // Inicializa el formulario reactivo
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async sendPasswordReset() {
    this.mensaje = '';
    this.cargando = true; // Activa el indicador de carga

    if (this.resetPasswordForm.invalid) {
      this.mensaje = 'Por favor, ingresa un correo electrónico válido.';
      this.cargando = false;
      return;
    }

    const email = this.resetPasswordForm.value.email;

    try {
      await this.authService.resetPassword(email);
      this.mensaje =
        'Revisa tu correo electrónico para restablecer la contraseña.';

      // Muestra el alert antes de redirigir al login
      await this.presentAlert();
    } catch (error: any) {
      console.error('Error al enviar el enlace de recuperación:', error);
      this.mensaje =
        'Hubo un error al enviar el enlace de recuperación. Intenta nuevamente.';
    } finally {
      this.cargando = false; // Desactiva el indicador de carga
    }
  }

  // Función para mostrar el alert
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Enlace Enviado',
      message:
        'El enlace de recuperación ha sido enviado a tu correo. Serás redirigido al login',
      buttons: [
        {
          text: 'Ir al Login',
          handler: () => {
            // Redirige al usuario al login
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }
}
