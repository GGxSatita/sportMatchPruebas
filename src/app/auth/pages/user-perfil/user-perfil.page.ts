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
import { DeportesService } from 'src/app/services/deportes.service'; // Servicio de deportes
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
  deportesService: DeportesService = inject(DeportesService); // Inyectar servicio de deportes

  profileForm: FormGroup;
  user: { email: string, name: string, photo: string };
  userProfile: Models.Auth.UserProfile;
  deportes: Deporte[] = []; // Lista de deportes
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
      deporteFavorito: ['', Validators.required] // Campo para el deporte favorito
    });

    // Cargar deportes desde Firestore
    this.deportesService.getDeportes().subscribe((deportes: Deporte[]) => {
      this.deportes = deportes;
    });
  }

  // Método para alternar el modo de edición
  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  getDatosProfile(uid: string) {
    this.firestoreService.getDocumentChanges<Models.Auth.UserProfile>(`${Models.Auth.PathUsers}/${uid}`).subscribe(res => {
      if (res) {
        this.userProfile = res;
        // Rellenar el formulario con los datos del perfil
        this.profileForm.patchValue({
          nuevaEdad: this.userProfile.edad,
          deporteFavorito: this.userProfile.deporteFavorito // Cargar deporte favorito en el formulario
        });
      }
      this.cargando = false;
    });
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files?.[0]; // Verifica si el archivo existe
    if (file) {
      console.log('Archivo seleccionado:', file);
      this.profileForm.patchValue({ newFoto: file });
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
  }
  async actualizarPerfil() {
    if (this.profileForm.valid) {
      const formValues = this.profileForm.value;

      if (formValues.newFoto) {
        const file = formValues.newFoto as File;
        const filePath = `users/${this.user.email}/profile_picture_${new Date().getTime()}.jpg`;

        // Subir la imagen y obtener la URL
        this.storageService.uploadFile(filePath, file).subscribe({
          next: async (downloadURL) => {
            // Actualizar Firebase Authentication con la nueva URL
            const data = { photoURL: downloadURL, displayName: formValues.newName };
            await this.actualizarDatosUsuario(data);

            // Reflejar la nueva imagen en el perfil
            this.user.photo = downloadURL;
          },
          error: (error) => console.error('Error al subir la imagen:', error)
        });
      } else {
        const data = { displayName: formValues.newName };
        await this.actualizarDatosUsuario(data);
      }
    }
  }

  private async actualizarDatosUsuario(data: { displayName?: string, photoURL?: string }) {
    if (this.user) {
      // Actualizar perfil en Firebase Authentication
      await this.autenticacionService.updateProfile(data);

      // Forzar la recarga de los datos del usuario en Firebase Authentication
      const user = this.autenticacionService.getCurrentUser();
      await user.reload();  // Verifica que los cambios se hayan reflejado

      // Actualizar Firestore con la nueva información
      const updateData = {
        name: user.displayName,
        photo: user.photoURL,  // Guardar la nueva URL de la imagen
        edad: this.profileForm.value.nuevaEdad,
        deporteFavorito: this.profileForm.value.deporteFavorito
      };

      await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateData);

      // Reflejar los cambios en la vista
      this.user = {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL ? user.photoURL : 'assets/default-profile.png'
      };

      this.toggleEditMode();
    }
  }


  async actualizarEdad() {
    if (this.profileForm.get('nuevaEdad').valid) {
      const user = this.autenticacionService.getCurrentUser();
      const updateDoc = { edad: this.profileForm.value.nuevaEdad };
      await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateDoc);
      this.toggleEditMode();
    }
  }

  // Manejador de errores de carga de imagen
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
