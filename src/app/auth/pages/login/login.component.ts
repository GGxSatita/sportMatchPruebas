import { Component, inject, OnInit } from '@angular/core';
import { Models } from 'src/app/models/models';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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

  // Método de inicio de sesión
  async login() {
    if (!this.form.email || !this.form.password) {
      this.showEmailError = !this.form.email;
      this.showPasswordError = !this.form.password;
      await this.showErrorAlert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const user = await this.autenticacionService.login(this.form.email, this.form.password);
      if (user) {
        console.log('Login exitoso');
        this.router.navigate(['/menu-principal']);
      }
    } catch (error) {
      // Verifica si el error es de tipo `Error` para acceder a la propiedad `message`
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
