import { Component, inject, OnInit } from '@angular/core';
import { Models } from 'src/app/models/models';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importar AlertController para mostrar alertas

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: Models.Auth.DatosLogin; //formulario
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController); // Inyectar AlertController
  user: { email: string; name: string };

  constructor() {
    this.initForm();

    // Este método nos permite estar suscritos a los cambios que tenga nuestro usuario
    // ya sea que hizo login, logout o cualquier otro cambio
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
      const user = this.autenticacionService.getCurrentUser();
      console.log('currentUser ->', user);
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

  // Mostrar alerta de error de autenticación
  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de autenticación',
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Método de login
  async login() {
    if (this.form?.email && this.form?.password) {
      try {
        // Validamos que el email sea un formato correcto antes de intentar el login
        if (!this.validateEmail(this.form.email)) {
          await this.showErrorAlert('El formato del correo electrónico no es válido.');
          return;
        }

        // Realizamos el login a través del servicio de autenticación
        const user = await this.autenticacionService.login(this.form.email, this.form.password);
        if (user) {
          // Redirigimos al menú principal si el login es exitoso
          this.router.navigate(['/menu-principal']);
        }
      } catch (error: any) {
        console.log('Error al iniciar sesión:', error);

        // Manejo de errores específicos de Firebase Authentication
        let errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.';

        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No se encontró un usuario con ese correo. Verifica tus datos.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Contraseña incorrecta. Por favor, intenta de nuevo.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
        }

        // Mostrar alerta con el mensaje de error específico
        await this.showErrorAlert(errorMessage);
      }
    } else {
      // Si los campos están vacíos, mostramos una alerta
      await this.showErrorAlert('Por favor, completa todos los campos.');
    }
  }

  // Validación simple del formato del correo electrónico
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  goToRecoverPassword() {
    this.router.navigate(['/recuperar-contrasena']);
  }
}
