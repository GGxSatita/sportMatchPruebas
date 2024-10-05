import { Component, inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from './../../../services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DeportesService } from 'src/app/services/deportes.service'; // Servicio de deportes
import { Deporte } from 'src/app/models/deporte'; // Importar la interfaz Deporte
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  firestoreService: FirestoreService = inject(FirestoreService);
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService); // Inyectar servicio de deportes
  alertController: AlertController = inject(AlertController);
  router: Router = inject(Router);

  // Lista de deportes disponibles
  deportes: Deporte[] = []; // Cambiar a tipo Deporte[]

  // Formulario
  datosForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    photo: ['', Validators.required],
    edad: [null, [Validators.required, Validators.min(16), Validators.max(99)]],
    deporteFavorito: ['', Validators.required], // Deporte favorito, el ID será el valor seleccionado
  });

  cargando: boolean = false;
  errorMensaje: string | null = null;
  imageUrl: string = ''; // Para almacenar la URL de la foto de perfil

  constructor(private fb: FormBuilder, private injector: Injector) {}

  ngOnInit() {
    // Inyectar los servicios cuando sea necesario
    this.firestoreService = this.injector.get(FirestoreService);
  this.autenticacionService = this.injector.get(AutenticacionService);
  this.storageService = this.injector.get(StorageService);
  this.deportesService = this.injector.get(DeportesService);
  this.router = this.injector.get(Router);
  this.alertController = this.injector.get(AlertController);

    // Cargar la lista de deportes desde Firestore
    this.deportesService.getDeportes().subscribe((deportes: Deporte[]) => {
      this.deportes = deportes;
    });
  }

  // Mostrar alerta si el correo ya está registrado
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
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }

  // Registro de usuario
  async registrarse() {
    this.cargando = true;
    this.errorMensaje = null;

    const email = this.datosForm.value.email;

    if (this.datosForm.valid) {
      try {
        // Verificar si el email ya está registrado
        const emailExists = await this.autenticacionService.isEmailRegistered(email);

        if (emailExists) {
          // Mostrar alerta si el correo ya está registrado
          await this.showUserExistsAlert();
          this.cargando = false;
          return;
        }

        // Crear el usuario en Firebase Authentication
        const data = this.datosForm.value;
        const res = await this.autenticacionService.createUser(data.email, data.password);

        let profile: Models.Auth.UpdateProfileI = {
          displayName: data.name,
          photoURL: data.photo,
        };
        await this.autenticacionService.updateProfile(profile);

        // Obtener el nombre del deporte seleccionado
        const deporteSeleccionado = this.deportes.find(d => d.nombre === data.deporteFavorito);

        // Guardar el perfil de usuario en Firestore
        const datosUser: Models.Auth.UserProfile = {
          name: data.name,
          photo: data.photo,
          edad: data.edad,
          id: res.user.uid,
          email: data.email,
          deporteFavorito: deporteSeleccionado ? deporteSeleccionado.nombre : '', // Guardar el nombre del deporte
        };

        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, res.user.uid);
        console.log('Usuario creado con éxito');
        this.router.navigate(['/login']);
      } catch (error: any) {
        // Manejo de errores
        if (error.message === 'auth/email-already-in-use') {
          await this.showUserExistsAlert();
        } else {
          console.log('REGISTRARSE ERROR ->', error);
          this.errorMensaje = 'Hubo un error durante el registro. Intenta de nuevo más tarde.';
        }
      }
    }
    this.cargando = false;
  }

  // Subir la foto de perfil a Firebase Storage
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
