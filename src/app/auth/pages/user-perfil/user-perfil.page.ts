import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonCardContent,
  IonCardHeader,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonItem,
  IonLabel,
  IonSpinner,
  IonCardTitle,
  IonList,
  IonImg,
  IonCol,
  IonRow,
  IonGrid,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { DeportesService } from 'src/app/services/deportes.service';
import { Models, ScoreModel } from 'src/app/models/models';
import { Router } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { Deporte } from 'src/app/models/deporte';

@Component({
  selector: 'app-user-perfil',
  templateUrl: './user-perfil.page.html',
  styleUrls: ['./user-perfil.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonSpinner,
    IonLabel,
    IonItem,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonList,
    HeaderComponent,
    FooterComponent,
  ],
})
export class UserPerfilPage implements OnInit {
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  firestoreService: FirestoreService = inject(FirestoreService);
  storageService: StorageService = inject(StorageService);
  deportesService: DeportesService = inject(DeportesService);
  userScore: ScoreModel | null = null; // Para almacenar el puntaje y rango del usuario

  profileForm: FormGroup;
  user: { email: string; name: string; photo: string };
  userProfile: Models.Auth.UserProfile;
  deportes: Deporte[] = [];
  cargando: boolean = false;
  isEditing: boolean = false;
  Object: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.cargando = true;
    this.autenticacionService.authState.subscribe((res) => {
      if (res) {
        this.user = {
          email: res.email,
          name: res.displayName,
          photo: res.photoURL ? res.photoURL : 'assets/default-profile.png',
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
      deporteFavorito: ['', Validators.required],
    });

    this.deportesService.getDeportes().subscribe((deportes: Deporte[]) => {
      this.deportes = deportes;
    });
    this.getUserScore();
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  getDatosProfile(uid: string) {
    this.firestoreService
      .getDocumentChanges<Models.Auth.UserProfile>(
        `${Models.Auth.PathUsers}/${uid}`
      )
      .subscribe((res) => {
        if (res) {
          this.userProfile = res;
          this.profileForm.patchValue({
            nuevaEdad: this.userProfile.edad,
            deporteFavorito: this.userProfile.deporteFavorito,
          });

          this.user.photo =
            this.userProfile.photo || 'assets/default-profile.png';

          // Después de obtener el perfil, buscar el puntaje para el deporte favorito
          this.getScoreByFavoriteSport(this.userProfile.deporteFavorito);
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
        const filePath = `users/${
          this.user.email
        }/profile_picture_${new Date().getTime()}.jpg`;

        this.storageService.uploadFile(filePath, file).subscribe({
          next: async (downloadURL) => {
            const data = {
              photoURL: downloadURL,
              displayName: formValues.newName,
            };
            await this.actualizarDatosUsuario(data);
            this.user.photo = downloadURL;
            this.redirigirPerfilActualizado();
          },
          error: (error) => console.error('Error al subir la imagen:', error),
        });
      } else {
        const data = { displayName: formValues.newName };
        await this.actualizarDatosUsuario(data);
        this.redirigirPerfilActualizado();
      }
    }
  }

  private async actualizarDatosUsuario(data: {
    displayName?: string;
    photoURL?: string;
  }) {
    if (this.user) {
      await this.autenticacionService.updateProfile(data);

      const user = this.autenticacionService.getCurrentUser();
      await user.reload();

      const updateData = {
        name: user.displayName,
        photo: user.photoURL,
        edad: this.profileForm.value.nuevaEdad,
        deporteFavorito: this.profileForm.value.deporteFavorito,
      };

      await this.firestoreService.updateDocument(
        `${Models.Auth.PathUsers}/${user.uid}`,
        updateData
      );

      this.user = {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL ? user.photoURL : 'assets/default-profile.png',
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
          photo: user.photoURL || 'assets/default-profile.png',
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

  // Nueva función para obtener el puntaje según el deporte favorito
  async getScoreByFavoriteSport(deporteFavorito: string) {
    try {
      if (!this.userProfile || !deporteFavorito) {
        console.warn('Deporte favorito no definido.');
        return;
      }

      // Verifica si el puntaje está disponible para el deporte favorito
      if (
        this.userScore &&
        this.userScore.deportes &&
        this.userScore.deportes[deporteFavorito]
      ) {
        const puntaje = this.userScore.deportes[deporteFavorito];
        console.log('Puntaje para el deporte favorito:', puntaje);
        // Aquí puedes actualizar alguna variable de la UI con el puntaje, si lo deseas.
      } else {
        console.warn('No se encontró el puntaje para el deporte favorito.');
      }
    } catch (error) {
      console.error(
        'Error al obtener el puntaje para el deporte favorito:',
        error
      );
    }
  }
  // Este método está correctamente definido en tu componente
  async getUserScore() {
    try {
      const currentUser = await this.autenticacionService.getCurrentUserAsync();
      if (!currentUser) {
        console.warn('No se encontró al usuario actual.');
        return;
      }

      const userId = currentUser.uid; // ID del usuario actual
      const scorePath = `scores/${userId}`; // Ruta del documento en Firestore
      this.userScore = await this.firestoreService.getDocument<ScoreModel>(
        scorePath
      );

      if (this.userScore) {
        console.log('Puntaje del usuario obtenido:', this.userScore);
        console.log('Deportes del usuario:', this.userScore.deportes);

        // Verificar el puntaje para el deporte favorito
        const deporteFavorito = this.userProfile.deporteFavorito?.trim(); // Eliminar espacios en deporteFavorito

        // Usar trim() en las claves de deportes para buscar el puntaje
        const deportes = this.userScore.deportes;
        const deporte =
          deportes &&
          deportes[
            Object.keys(deportes).find((key) => key.trim() === deporteFavorito)
          ];

        if (deporte) {
          console.log(`Puntaje para ${deporteFavorito}:`, deporte.score);
          console.log(`Rango para ${deporteFavorito}:`, deporte.rank);
        } else {
          console.warn(
            `No se encontró puntaje para el deporte favorito (${deporteFavorito})`
          );
        }
      } else {
        console.warn(
          'No se encontró el puntaje del usuario en la base de datos.'
        );
      }
    } catch (error) {
      console.error('Error al obtener el puntaje del usuario:', error);
    }
  }
  getFavoriteSportData(type: 'score' | 'rank'): string | number {
    if (!this.userProfile?.deporteFavorito || !this.userScore?.deportes) {
      return 'No disponible';
    }

    // Limpiar espacios del deporte favorito y de las claves de deportes
    const deporteFavorito = this.userProfile.deporteFavorito.trim();
    const deporteKey = Object.keys(this.userScore.deportes).find(
      (key) => key.trim() === deporteFavorito
    );

    // Si no se encuentra el deporte, devolver "No disponible"
    if (!deporteKey) {
      return 'No disponible';
    }

    // Retornar el score o el rank según el parámetro `type`
    const deporteData = this.userScore.deportes[deporteKey];
    return type === 'score' ? deporteData.score : deporteData.rank;
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
  goToPuntajesPorDeporte() {
    this.router.navigate(['/puntajes-por-deporte']);
  }
}
