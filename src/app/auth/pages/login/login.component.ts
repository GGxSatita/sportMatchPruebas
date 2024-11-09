import { Component, inject, OnInit } from '@angular/core';
import { Models } from 'src/app/models/models';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: Models.Auth.DatosLogin; // Formulario de datos de login
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController);

  // Flags para mostrar errores
  showEmailError = false;
  showPasswordError = false;

  private auth = inject(Auth);

  constructor() {
    this.initForm();
  }

  ngOnInit() {}

  // Inicializar el formulario
  initForm() {
    this.form = {
      email: '',
      password: '',
    };
  }

  // Validar el campo de email y mostrar/ocultar error
  validateEmailField() {
    this.showEmailError = !this.form.email;
  }

  hideEmailError() {
    this.showEmailError = false;
  }

  // Validar el campo de contraseña y mostrar/ocultar error
  validatePasswordField() {
    this.showPasswordError = !this.form.password;
  }

  hidePasswordError() {
    this.showPasswordError = false;
  }

  // Mostrar mensaje de error de autenticación
  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de autenticación',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async login() {
    if (!this.form.email || !this.form.password) {
      this.showEmailError = !this.form.email;
      this.showPasswordError = !this.form.password;
      await this.showErrorAlert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const userCredential = await this.autenticacionService.login(this.form.email, this.form.password);
      const user = userCredential.user;

      // Verificar si el usuario tiene una sanción activa
      const sancionActiva = await this.autenticacionService.obtenerSancionActiva(user.uid);

      if (sancionActiva) {
        const fechaExpiracionSancion = sancionActiva.fechaExpiracionSancion instanceof Timestamp
          ? sancionActiva.fechaExpiracionSancion.toDate()
          : sancionActiva.fechaExpiracionSancion;

        const fechaExpiracion = fechaExpiracionSancion.toLocaleString();

        // Crear mensaje de sanción con formato mejorado
        const mensajeSancion = `⚠️ Tu cuenta ha sido suspendida temporalmente ⚠️

  📅 Válido hasta: ${fechaExpiracion}
  📌 Motivo: ${sancionActiva.razon}

  Por favor, contacta a soporte si tienes alguna pregunta o crees que esto es un error.`;

        // Desconectar al usuario inmediatamente
        await this.autenticacionService.logout();

        // Mostrar alerta con los detalles de la sanción
        await this.showErrorAlert(mensajeSancion);
      } else {
        console.log('Login exitoso');
        this.router.navigate(['/menu-principal']);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al iniciar sesión.';
      await this.showErrorAlert(errorMessage);
    }
  }






  // Validar formato de correo electrónico
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Navegar a la página de recuperación de contraseña
  goToRecoverPassword() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}
