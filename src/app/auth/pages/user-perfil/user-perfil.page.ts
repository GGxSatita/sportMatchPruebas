import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonContent, IonCardContent, IonCardHeader, IonHeader, IonTitle,
  IonToolbar, IonButton, IonIcon, IonCard, IonItem, IonLabel,
  IonSpinner, IonCardTitle, IonList, IonImg, IonCol, IonRow
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DeportesService } from 'src/app/services/deportes.service';
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Deporte } from 'src/app/models/deporte';

@Component({
  selector: 'app-user-perfil',
  templateUrl: './user-perfil.page.html',
  styleUrls: ['./user-perfil.page.scss'],
  standalone: true,
  imports: [
    IonRow, IonCol, IonImg, IonSpinner, IonLabel, IonItem, IonButton, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, ReactiveFormsModule, IonIcon, IonCard,
    IonCardHeader, IonCardContent, IonCardTitle, IonList, HeaderComponent, FooterComponent
  ]
})
export class UserPerfilPage implements OnInit {

  autenticacionService: AutenticacionService = inject(AutenticacionService);
  firestoreService: FirestoreService = inject(FirestoreService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService);

  profileForm: FormGroup;
  user: { email: string, name: string, photo: string };
  userProfile: Models.Auth.UserProfile;
  deportes: Deporte[] = [];
  cargando: boolean = false;
  isEditing: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.cargando = true;
    this.autenticacionService.authState.subscribe(res => {
      if (res) {
        this.user = {
          email: res.email,
          name: res.displayName,
          photo: res.photoURL ? res.photoURL : 'assets/default-profile.png'
        };
        this.getDatosProfile(res.uid);
      } else {
        this.user = null;
        this.cargando = false;
      }
    });
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      newName: ['', [Validators.required, Validators.minLength(3)]],
      newFoto: [null],
      nuevaEdad: ['', [Validators.required, Validators.min(1)]],
      deporteFavorito: ['', Validators.required]
    });

    this.deportesService.getDeportes().subscribe((deportes: Deporte[]) => {
      this.deportes = deportes;
    });
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  getDatosProfile(uid: string) {
    this.firestoreService.getDocumentChanges<Models.Auth.UserProfile>(`${Models.Auth.PathUsers}/${uid}`).subscribe(res => {
      if (res) {
        this.userProfile = res;
        this.profileForm.patchValue({
          nuevaEdad: this.userProfile.edad,
          deporteFavorito: this.userProfile.deporteFavorito
        });

        this.user.photo = this.userProfile.photo || 'assets/default-profile.png';
      }
      this.cargando = false;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      this.user.photo = objectURL;
      this.profileForm.patchValue({ newFoto: file });
    }
  }

  async actualizarPerfil() {
    if (this.profileForm.valid) {
      const formValues = this.profileForm.value;

      if (formValues.newFoto) {
        const file = formValues.newFoto as File;
        const filePath = `users/${this.user.email}/profile_picture_${new Date().getTime()}.jpg`;

        this.storageService.uploadFile(filePath, file).subscribe({
          next: async (downloadURL) => {
            const data = { photoURL: downloadURL, displayName: formValues.newName };
            await this.actualizarDatosUsuario(data);
            this.user.photo = downloadURL;
            this.redirigirPerfilActualizado();
          },
          error: (error) => console.error('Error al subir la imagen:', error)
        });
      } else {
        const data = { displayName: formValues.newName };
        await this.actualizarDatosUsuario(data);
        this.redirigirPerfilActualizado();
      }
    }
  }

  private async actualizarDatosUsuario(data: { displayName?: string, photoURL?: string }) {
    if (this.user) {
      await this.autenticacionService.updateProfile(data);

      const user = this.autenticacionService.getCurrentUser();
      await user.reload();

      const updateData = {
        name: user.displayName,
        photo: user.photoURL,
        edad: this.profileForm.value.nuevaEdad,
        deporteFavorito: this.profileForm.value.deporteFavorito
      };

      await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateData);

      this.user = {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL ? user.photoURL : 'assets/default-profile.png'
      };
    }
  }

  async refrescarDatos() {
    try {
      this.cargando = true;

      // Recargar el usuario autenticado desde Firebase Auth
      await this.autenticacionService.reloadUser();

      const user = this.autenticacionService.getCurrentUser();
      if (user) {
        this.user = {
          email: user.email,
          name: user.displayName || 'Nombre no disponible',
          photo: user.photoURL || 'assets/default-profile.png'
        };

        // Obtener los datos del perfil desde Firestore y sincronizarlos
        this.getDatosProfile(user.uid);
      }

    } catch (error) {
      console.error('Error al refrescar los datos del usuario:', error);
    } finally {
      this.cargando = false;
    }
  }

  redirigirPerfilActualizado() {
    this.router.navigate(['/user-perfil']);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png';
  }

  salir() {
    this.autenticacionService.logout();
  }

  goToEditProfile() {
    this.router.navigate(['/editar-perfil']);
  }

  goToCambiarContrasena() {
    this.router.navigate(['/cambiar-contrasena']);
  }
}
