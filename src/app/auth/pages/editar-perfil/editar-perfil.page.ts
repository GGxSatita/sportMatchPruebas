import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSpinner,
  IonCol,
  IonRow,
  IonIcon,
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonRow,
    IonCol,
    IonSpinner,
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    HeaderComponent,
    FooterComponent,
  ],
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
      nuevaEdad: [
        '',
        [Validators.required, Validators.min(16), Validators.max(99)],
      ],
      deporteFavorito: ['', Validators.required],
      newFoto: [null],
    });

    // Obtener usuario actual
    this.autenticacionService.authState.subscribe((res) => {
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
    this.firestoreService
      .getDocumentChanges<ModelsAuth.UserProfile>(
        `${ModelsAuth.PathUsers}/${uid}`
      )
      .subscribe((res) => {
        if (res) {
          this.userProfile = res;
          this.profileForm.patchValue({
            newName: this.userProfile.name,
            nuevaEdad: this.userProfile.edad,
            deporteFavorito: this.userProfile.deporteFavorito,
          });
          this.imageUrl =
            this.userProfile.photo || 'assets/img/default-profile.png';
          this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.imageUrl
          );
        }
        this.cargando = false;
      });
  }

  // Mostrar la imagen seleccionada sin subirla aún
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(this.selectedFile)
      );
    }
  }


  async actualizarPerfil() {
    this.subiendoImagen = true;

    if (this.profileForm.valid) {
      const formValues = this.profileForm.value;
      let data: any = {};

      // Si se ha seleccionado una nueva imagen
      if (this.selectedFile) {
        const filePath = `users/${this.user.email}/profile_picture_${new Date().getTime()}.jpg`;

        this.storageService.uploadFile(filePath, this.selectedFile).subscribe({
          next: async (downloadURL) => {
            data.photoURL = downloadURL;
            this.user.photoURL = downloadURL; // Actualizamos inmediatamente la foto en el perfil

            // Actualizar Firebase Authentication con la nueva URL
            await this.autenticacionService.updateProfile(data);

            // Reflejar los cambios en la vista del perfil directamente sin esperar la recarga
            await this.actualizarDatosUsuario({
              displayName: formValues.newName,
              photoURL: downloadURL
            });

            this.subiendoImagen = false;
            this.router.navigate(['/user-perfil']);
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            this.subiendoImagen = false;
          }
        });
      } else {
        await this.actualizarDatosUsuario({
          displayName: formValues.newName
        });
        this.subiendoImagen = false;
        this.router.navigate(['/user-perfil']);
      }
    }
  }



  private async actualizarDatosUsuario(data: { displayName?: string, photoURL?: string }) {
    const formValues = this.profileForm.value;

    if (formValues.newName) {
      data.displayName = formValues.newName;
    }

    if (data.photoURL) {
      await this.autenticacionService.updateProfile({
        photoURL: data.photoURL
      });
    }

    const user = this.autenticacionService.getCurrentUser();

    // Reflejar los cambios en Firestore inmediatamente
    const updateData = {
      name: user.displayName,
      photo: data.photoURL || user.photoURL,  // Reflejar la nueva URL de la imagen
      edad: formValues.nuevaEdad,
      deporteFavorito: formValues.deporteFavorito
    };

    await this.firestoreService.updateDocument(`${ModelsAuth.PathUsers}/${user.uid}`, updateData);

    // Forzar la actualización de la vista de usuario
    this.user = {
      email: user.email,
      name: user.displayName,
      photo: data.photoURL || user.photoURL || 'assets/default-profile.png'
    };
  }



  cancelar() {
    this.router.navigate(['/user-perfil']);
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const blob = await fetch(image.dataUrl).then((r) => r.blob());
      const file = new File([blob], `camera_${new Date().getTime()}.jpg`, {
        type: 'image/jpeg',
      });
      this.selectedFile = file;
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'User cancelled photos app') {
        console.log('El usuario canceló la operación de la cámara');
      } else {
        console.error('Error al tomar la foto:', error);
      }
    }
  }

  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      const blob = await fetch(image.dataUrl).then((r) => r.blob());
      const file = new File([blob], `gallery_${new Date().getTime()}.jpg`, {
        type: 'image/jpeg',
      });
      this.selectedFile = file;
      this.profileImage = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'User cancelled photos app') {
        console.log('El usuario canceló la selección de la galería');
      } else {
        console.error('Error al seleccionar la foto:', error);
      }
    }
  }

}
