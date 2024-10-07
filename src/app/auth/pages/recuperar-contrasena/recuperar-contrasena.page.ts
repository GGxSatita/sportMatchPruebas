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
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,  // Importa FormsModule si lo usas para otros componentes
    ReactiveFormsModule,  // Importa ReactiveFormsModule para formularios reactivos
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
    IonInput
  ],
})
export class RecuperarContrasenaPage implements OnInit {
  resetPasswordForm: FormGroup;
  mensaje: string;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService
  ) {}

  ngOnInit() {
    // Inicializa el formulario reactivo
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async sendPasswordReset() {
    this.mensaje = '';

    if (this.resetPasswordForm.invalid) {
      this.mensaje = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    const email = this.resetPasswordForm.value.email;

    try {
      await this.authService.resetPassword(email);
      this.mensaje = 'Revisa tu correo electrónico para restablecer la contraseña.';
    } catch (error: any) {
      console.error('Error al enviar el enlace de recuperación:', error);
      this.mensaje = 'Hubo un error al enviar el enlace de recuperación. Intenta nuevamente.';
    }
  }
}
