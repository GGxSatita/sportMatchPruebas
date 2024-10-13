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
  form: Models.Auth.DatosLogin; // Formulario
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController);
  user: { email: string; name: string };

  showEmailError = false; // Control de error de email
  showPasswordError = false; // Control de error de contraseña

  constructor() {
    this.initForm();

    this.autenticacionService.authState.subscribe((res) => {
      console.log('res ->', res);
      if (res) {
        this.user = {
          email: res.email,
          name: res.displayName,
        };
      } else {
        this.user = null;
      }
    });
  }

  ngOnInit() {}

  // Inicializar el formulario
  initForm() {
    this.form = {
      email: '',
      password: '',
    };
  }

  // Controlar error en campo email
  validateEmailField() {
    this.showEmailError = !this.form.email;
  }

  hideEmailError() {
    this.showEmailError = false;
  }

  // Controlar error en campo contraseña
  validatePasswordField() {
    this.showPasswordError = !this.form.password;
  }

  hidePasswordError() {
    this.showPasswordError = false;
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de autenticación',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async login() {
    if (this.form?.email && this.form?.password) {
      try {
        if (!this.validateEmail(this.form.email)) {
          await this.showErrorAlert('El formato del correo electrónico no es válido.');
          return;
        }

        const user = await this.autenticacionService.login(this.form.email, this.form.password);
        if (user) {
          this.router.navigate(['/menu-principal']);
        }
      } catch (error: any) {
        console.log('Error al iniciar sesión:', error);

        let errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.';
        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No se encontró un usuario con ese correo.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Contraseña incorrecta. Intenta de nuevo.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
        }

        await this.showErrorAlert(errorMessage);
      }
    } else {
      await this.showErrorAlert('Por favor, completa todos los campos.');
    }
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  goToRecoverPassword() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}
