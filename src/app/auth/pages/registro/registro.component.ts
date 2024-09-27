import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from './../../../services/firestore.service';
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importar AlertController para mostrar alertas

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  firestoreService: FirestoreService = inject(FirestoreService);
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  router: Router = inject(Router);
  alertController: AlertController = inject(AlertController); // Inyectar AlertController

  // Formulario
  datosForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    photo: ['', Validators.required],
    edad: [null, [Validators.required, Validators.min(16), Validators.max(99)]],
  });

  cargando: boolean = false;
  errorMensaje: string | null = null; // Agregar esta propiedad

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}

  // Mostrar alerta cuando el correo ya esté registrado
  async showUserExistsAlert() {
    const alert = await this.alertController.create({
      header: 'Correo ya registrado',
      message: 'Este correo ya está registrado. ¿Deseas iniciar sesión en su lugar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Iniciar Sesión',
          handler: () => {
            this.router.navigate(['/login']); // Redirigir al login
          },
        },
      ],
    });

    await alert.present();
  }

  async registrarse() {
    this.cargando = true;
    this.errorMensaje = null; // Reiniciar el mensaje de error

    const email = this.datosForm.value.email;

    if (this.datosForm.valid) {
      try {
        // Verificar si el email ya está registrado
        const emailExists = await this.autenticacionService.isEmailRegistered(email);

        if (emailExists) {
          // Si el correo ya está registrado, mostrar la alerta
          await this.showUserExistsAlert();
          this.cargando = false;
          return;
        }

        // Si el correo no está registrado, proceder con el registro
        const data = this.datosForm.value;
        const res = await this.autenticacionService.createUser(data.email, data.password);

        let profile: Models.Auth.UpdateProfileI = {
          displayName: data.name,
          photoURL: data.photo,
        };
        await this.autenticacionService.updateProfile(profile);

        const datosUser: Models.Auth.UserProfile = {
          name: data.name,
          photo: data.photo,
          edad: data.edad,
          id: res.user.uid,
          email: data.email,
        };

        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, res.user.uid);
        console.log('Usuario creado con éxito');
        this.router.navigate(['/login']);
      } catch (error) {
        console.log('REGISTRARSE ERROR ->', error);
        this.errorMensaje = 'Hubo un error durante el registro. Intenta de nuevo más tarde.'; // Asignar un mensaje de error
      }
    }
    this.cargando = false;
  }
}
