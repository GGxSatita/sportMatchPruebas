import { Component, inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from './../../../services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DeportesService } from 'src/app/services/deportes.service';
import { Deporte } from 'src/app/models/deporte';
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importar Capacitor Camera
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';  // Importar los elementos PWA

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  firestoreService: FirestoreService = inject(FirestoreService);
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService);
  alertController: AlertController = inject(AlertController);
  router: Router = inject(Router);

  // Lista de deportes disponibles
  deportes: Deporte[] = [];

  // Formulario
  datosForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    photo: ['', Validators.required],
    edad: [null, [Validators.required, Validators.min(16), Validators.max(99)]],
    deporteFavorito: ['', Validators.required],
  });

  cargando: boolean = false;
  errorMensaje: string | null = null;
  imageUrl: string = ''; // Para almacenar la URL de la foto de perfil
  profileImage: SafeResourceUrl | null = null; // Para almacenar la imagen seleccionada

  constructor(private fb: FormBuilder, private injector: Injector, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Registrar los elementos PWA cuando la aplicación cargue
    defineCustomElements(window);

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
          deporteFavorito: deporteSeleccionado ? deporteSeleccionado.nombre : '',
        };

        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, res.user.uid);
        console.log('Usuario creado con éxito');

        // Limpiar los datos del formulario después del registro exitoso
        this.datosForm.reset();
        this.imageUrl = '';
        this.profileImage = null;

        this.router.navigate(['/menu-principal']);
      } catch (error: any) {
        // Manejo de errores
        if (error instanceof Error && error.message === 'auth/email-already-in-use') {
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
  async uploadFile(file: File) {
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

  // Método para tomar una foto con la cámara
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      // Convertir la imagen a un blob y subirla
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `camera_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.uploadFile(file);
    } catch (error) {
      if (error instanceof Error && error.message === 'User cancelled photos app') {
        console.log('El usuario canceló la operación de la cámara');
      } else {
        console.error('Error al tomar la foto:', error);
      }
    }
  }

  // Método para seleccionar una imagen de la galería
  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      // Convertir la imagen a un blob y subirla
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `gallery_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.uploadFile(file);
    } catch (error) {
      if (error instanceof Error && error.message === 'User cancelled photos app') {
        console.log('El usuario canceló la selección de la galería');
      } else {
        console.error('Error al seleccionar la foto:', error);
      }
    }
  }
}
