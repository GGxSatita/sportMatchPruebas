import { Component, inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from './../../../services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importar AlertController para mostrar alertas
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  firestoreService: FirestoreService = inject(FirestoreService); // Inyectar servicio de Firestore
  autenticacionService: AutenticacionService = inject(AutenticacionService); // Inyectar servicio de autenticación
  storageService: StorageService = inject(StorageService); // Inyectar servicio de storage
  alertController: AlertController = inject(AlertController); // Inyectar AlertController
  router: Router = inject(Router);

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
  imageUrl: string = ''; // Declarar la propiedad imageUrl

  constructor(private fb: FormBuilder, private injector: Injector) {}

  ngOnInit() {
    // Inyectar los servicios solo cuando sea necesario
    this.firestoreService = this.injector.get(FirestoreService);
    this.autenticacionService = this.injector.get(AutenticacionService);
    this.storageService = this.injector.get(StorageService);
    this.router = this.injector.get(Router);
    this.alertController = this.injector.get(AlertController);
  }

  // Mostrar alerta cuando el correo ya esté registrado
  async showUserExistsAlert() {
    const alert = await this.alertController.create({
      header: 'Correo ya registrado',
      message:
        'Este correo ya está registrado. ¿Deseas iniciar sesión en su lugar?',
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
        const emailExists = await this.autenticacionService.isEmailRegistered(
          email
        );

        if (emailExists) {
          // Si el correo ya está registrado, mostrar la alerta
          await this.showUserExistsAlert();
          this.cargando = false;
          return;
        }

        // Si el correo no está registrado, proceder con el registro
        const data = this.datosForm.value;
        const res = await this.autenticacionService.createUser(
          data.email,
          data.password
        );

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

        await this.firestoreService.createDocument(
          Models.Auth.PathUsers,
          datosUser,
          res.user.uid
        );
        console.log('Usuario creado con éxito');
        this.router.navigate(['/login']);
      } catch (error: any) {
        // Manejar el error 'auth/email-already-in-use'
        if (error.message === 'auth/email-already-in-use') {
          await this.showUserExistsAlert();
        } else {
          console.log('REGISTRARSE ERROR ->', error);
          this.errorMensaje =
            'Hubo un error durante el registro. Intenta de nuevo más tarde.';
        }
      }
    }
    this.cargando = false;
  }

  async uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `profile_pictures/${new Date().getTime()}_${file.name}`;
      this.cargando = true;

      this.storageService.uploadFile(filePath, file).subscribe({
        next: (url) => {
          this.imageUrl = url;
          this.datosForm.patchValue({ photo: this.imageUrl });
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al subir la imagen:', err);
          this.cargando = false;
        },
      });
    }
  }


}
