import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonBackButton,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSpinner, IonCol, IonRow, IonIcon
} from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DeportesService } from 'src/app/services/deportes.service';
import { Deporte } from 'src/app/models/deporte';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { ModelsAuth } from 'src/app/models/auth.models';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonRow, IonCol, IonSpinner, CommonModule, ReactiveFormsModule, IonButton, IonInput, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonBackButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, HeaderComponent, FooterComponent
  ]
})
export class EditarPerfilPage implements OnInit {

  profileForm: FormGroup;
  deportes: Deporte[] = [];
  cargando: boolean = false;
  userProfile: ModelsAuth.UserProfile;
  user: any;
  subiendoImagen: boolean = false;
  imageUrl: string = ''; // Para almacenar la URL de la foto de perfil en uso
  profileImage: SafeResourceUrl | null = null; // Para mostrar la imagen seleccionada temporalmente
  selectedFile: File | null = null; // Archivo seleccionado temporalmente

  autenticacionService: AutenticacionService = inject(AutenticacionService);
  firestoreService: FirestoreService = inject(FirestoreService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService);
  router: Router = inject(Router);

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.cargando = true;
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      newName: ['', [Validators.required, Validators.minLength(3)]],
      nuevaEdad: ['', [Validators.required, Validators.min(16), Validators.max(99)]],
      deporteFavorito: ['', Validators.required],
      newFoto: [null],
    });

    // Obtener usuario actual
    this.autenticacionService.authState.subscribe(res => {
      if (res) {
        this.user = res;
        this.getDatosProfile(res.uid);
      }
    });

    // Cargar deportes
    this.deportesService.getDeportes().subscribe((deportes: Deporte[]) => {
      this.deportes = deportes;
    });
  }

  getDatosProfile(uid: string) {
    this.firestoreService.getDocumentChanges<ModelsAuth.UserProfile>(`${ModelsAuth.PathUsers}/${uid}`).subscribe(res => {
      if (res) {
        this.userProfile = res;
        this.profileForm.patchValue({
          newName: this.userProfile.name,
          nuevaEdad: this.userProfile.edad,
          deporteFavorito: this.userProfile.deporteFavorito
        });
        // Mostrar la imagen actual
        this.imageUrl = this.userProfile.photo || 'assets/img/default-profile.png';
        this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl);
      }
      this.cargando = false;
    });
  }

  // Guardar la imagen seleccionada temporalmente y mostrarla al usuario
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      // Crear una vista previa de la imagen seleccionada
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.selectedFile));
    }
  }

  async actualizarPerfil() {
    this.subiendoImagen = true;

    if (this.profileForm.valid) {
      let data: any = {};
      const formValues = this.profileForm.value;

      // Subir la imagen solo si se seleccionó una
      if (this.selectedFile) {
        const filePath = `users/${this.user.email}/profile_picture_${new Date().getTime()}.jpg`;
        this.storageService.uploadFile(filePath, this.selectedFile).subscribe({
          next: async (downloadURL) => {
            data.photoURL = downloadURL;
            this.user.photoURL = downloadURL;
            await this.actualizarDatosUsuario(data); // Actualizar los datos del usuario después de subir la imagen
            this.subiendoImagen = false;
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            this.subiendoImagen = false;
          }
        });
      } else {
        await this.actualizarDatosUsuario(data);
        this.subiendoImagen = false;
      }
    }
  }

  private async actualizarDatosUsuario(data: any) {
    const formValues = this.profileForm.value;

    if (formValues.newName) {
      data.displayName = formValues.newName;
    }

    if (data.photoURL) {
      await this.autenticacionService.updateProfile({ photoURL: data.photoURL });
    }

    const user = this.autenticacionService.getCurrentUser();
    await user.reload(); // Recargar los datos del usuario para reflejar los cambios

    const updateData = {
      name: user.displayName,
      photo: user.photoURL, // Guardar la nueva URL de la foto
      edad: formValues.nuevaEdad,
      deporteFavorito: formValues.deporteFavorito
    };

    // Actualizar el documento en Firestore
    await this.firestoreService.updateDocument(`${ModelsAuth.PathUsers}/${user.uid}`, updateData);

    // Redirigir al perfil del usuario
    this.router.navigate(['/user-perfil']);
  }

  cancelar() {
    this.router.navigate(['/user-perfil']);
  }

  // Método para tomar una foto con la cámara y mostrarla temporalmente
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      // Convertir la imagen a un blob y guardarla temporalmente
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `camera_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.selectedFile = file; // Guardar el archivo temporalmente
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)); // Vista previa
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  // Método para seleccionar una imagen de la galería y mostrarla temporalmente
  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      // Convertir la imagen a un blob y guardarla temporalmente
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `gallery_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.selectedFile = file; // Guardar el archivo temporalmente
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file)); // Vista previa
    } catch (error) {
      console.error('Error al seleccionar la foto:', error);
    }
  }
}
