import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonBackButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSpinner } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [IonSpinner,
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
  ]
})
export class EditarPerfilPage implements OnInit {

  profileForm: FormGroup;
  deportes: Deporte[] = [];
  cargando: boolean = false;
  userProfile: ModelsAuth.UserProfile;
  user: any;
  subiendoImagen: boolean = false; //Variable para controlar el spinner

  autenticacionService: AutenticacionService = inject(AutenticacionService);
  firestoreService: FirestoreService = inject(FirestoreService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService);
  router: Router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.cargando = true;
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      newName: ['', [Validators.required, Validators.minLength(3)]],
      nuevaEdad: ['', [Validators.required, Validators.min(1)]],
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
      }
      this.cargando = false;
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log('Archivo seleccionado:', file); // Verifica el archivo
      this.profileForm.patchValue({ newFoto: file });
    }
  }

  async actualizarPerfil() {
    this.subiendoImagen = true;  // Mostrar spinner mientras sube la imagen

    if (this.profileForm.valid) {
      let data: any = {};
      const formValues = this.profileForm.value;

      if (formValues.newFoto) {
        const filePath = `users/${this.user.email}/profile_picture.jpg`;
        this.storageService.uploadFile(filePath, formValues.newFoto).subscribe({
          next: async (downloadURL) => {
            data.photoURL = downloadURL;

            this.user.photoURL = downloadURL;  // Reflejar el cambio inmediatamente
            this.subiendoImagen = false;  // Ocultar spinner

            await this.actualizarDatosUsuario(data);
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            this.subiendoImagen = false;  // Ocultar spinner en caso de error
          }
        });
      } else {
        await this.actualizarDatosUsuario(data);
      }
    }
  }


  private async actualizarDatosUsuario(data: any) {
    const formValues = this.profileForm.value;

    if (formValues.newName) {
      data.displayName = formValues.newName;
    }

    // Actualizamos el perfil en Firebase Authentication
    if (data.photoURL) {
      await this.autenticacionService.updateProfile({ photoURL: data.photoURL });
    }

    // Forzamos la recarga de los datos del usuario
    const user = this.autenticacionService.getCurrentUser();
    await user.reload();  // Recargar los datos del usuario para reflejar los cambios

    // Ahora reflejamos los cambios en Firestore
    const updateData = {
      name: user.displayName,
      photo: user.photoURL,  // Aquí ya se reflejará la nueva URL de la foto
      edad: formValues.nuevaEdad,
      deporteFavorito: formValues.deporteFavorito
    };

    await this.firestoreService.updateDocument(`${ModelsAuth.PathUsers}/${user.uid}`, updateData);

    this.router.navigate(['/user-perfil']);
  }


  cancelar() {
    this.router.navigate(['/user-perfil']);
  }
}
