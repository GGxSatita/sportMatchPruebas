import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.page.html',
  styleUrls: ['./cambiar-contrasena.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, HeaderComponent, FooterComponent]
})
export class CambiarContrasenaPage implements OnInit {
  passwordForm: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private autenticacionService: AutenticacionService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordsMatch });
  }

  // Validador para verificar que las contraseñas coincidan
  passwordsMatch(control: AbstractControl) {
    const newPassword = control.get('newPassword').value;
    const confirmPassword = control.get('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Método para cambiar la contraseña
  async changePassword() {
    if (this.passwordForm.valid) {
      this.cargando = true;
      const currentPassword = this.passwordForm.get('currentPassword').value;
      const newPassword = this.passwordForm.get('newPassword').value;

      try {
        // Verificar la contraseña actual
        await this.autenticacionService.reauthenticate(currentPassword);

        // Cambiar la contraseña
        await this.autenticacionService.updatePassword(newPassword);

        // Mostrar éxito y redirigir
        this.showAlert('Éxito', 'Tu contraseña ha sido actualizada correctamente.');
        this.passwordForm.reset();
        this.router.navigate(['/user-perfil']); // Redirige a la página de perfil
      } catch (error) {
        this.showAlert('Error', 'Hubo un problema al cambiar la contraseña. Por favor, verifica tu contraseña actual.');
        console.error('Error al cambiar la contraseña:', error);
        this.showAlert('Error', 'Error al cambiar la contraseña.');
      } finally {
        this.cargando = false;
      }
    }
  }

  // Método para mostrar una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
