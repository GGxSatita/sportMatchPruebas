import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonSelect,
  IonLabel,
  IonButton,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonNote,
  IonIcon,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ClubesService } from 'src/app/services/clubes.service';
import { Router } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DeportesService } from 'src/app/services/deportes.service';
import { Deporte } from 'src/app/models/deporte';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StorageService } from 'src/app/services/storage.service'; // Importar el servicio de almacenamiento
import { Club } from 'src/app/models/club';

@Component({
  selector: 'app-crear-club',
  templateUrl: './crear-club.page.html',
  styleUrls: ['./crear-club.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonIcon,
    IonNote,
    IonButton,
    IonLabel,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    IonSelectOption,
    HeaderComponent,
    FooterComponent,
    IonInput,
    IonTextarea,
    IonSelect,
  ],
})
export class CrearClubPage implements OnInit {
  clubForm: FormGroup;
  deportes: Deporte[] = [];
  logoUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private clubesService: ClubesService,
    private deportesService: DeportesService,
    private storageService: StorageService, // Servicio para subir imágenes
    private router: Router
  ) {
    this.clubForm = this.fb.group({
      nombreClub: ['', Validators.required],
      descripcion: [''],
      logo: ['', Validators.required],
      deporteNombre: ['', Validators.required],
      maxMiembros: [10, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.cargarDeportes();
  }

  // Método para cargar los deportes desde el servicio
  cargarDeportes() {
    this.deportesService.getDeportes().subscribe((data) => {
      this.deportes = data;
    });
  }

  // Método para tomar una foto del logo
  async takeLogoPicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      // Subir la imagen
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `club_logo_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.uploadLogo(file);
    } catch (error) {
      console.error('Error al tomar la foto del logo:', error);
    }
  }

  // Método para seleccionar una foto de la galería
  async selectLogoFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      // Subir la imagen
      const blob = await fetch(image.dataUrl).then(r => r.blob());
      const file = new File([blob], `club_logo_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      this.uploadLogo(file);
    } catch (error) {
      console.error('Error al seleccionar la foto del logo:', error);
    }
  }

  // Método para subir el logo del club
  async uploadLogo(file: File) {
    if (file) {
      const filePath = `club_logos/${new Date().getTime()}_${file.name}`;
      this.storageService.uploadFile(filePath, file).subscribe({
        next: (url) => {
          this.logoUrl = url;
          this.clubForm.patchValue({ logo: this.logoUrl });
        },
        error: (err) => {
          console.error('Error al subir el logo:', err);
        },
      });
    }
  }

  // Verificar si el usuario ya pertenece a un club
  async verificarClubExistente() {
    const currentUser = await this.authService.getCurrentUserAsync();
    if (currentUser) {
      const club = await this.clubesService.getClubForUser(currentUser.uid);
      if (club) {
        // Redirigir si el usuario ya pertenece a un club
        await this.router.navigate([`/club/${club.idClub}`]);
      }
    }
  }

  // Método para crear un club
  async crearClub() {
    if (this.clubForm.valid) {
      const clubData = this.clubForm.value;
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.uid;

      if (userId) {
        const userProfile = await this.authService.getUserProfile(userId);

        if (!userProfile) {
          console.error('No se pudo obtener el perfil del usuario.');
          return;
        }

        const newClub: Club = {
          idClub: '', // Se llenará al guardar en Firestore
          nombreClub: clubData.nombreClub,
          logo: clubData.logo,
          descripcion: clubData.descripcion,
          maxMiembros: clubData.maxMiembros,
          adminId: userId,
          deporteNombre: clubData.deporteNombre,
          ranking: 0,
          miembros: [
            {
              userId: userId,
              profile: userProfile,
              role: 'lider', // Usando el literal correcto
              fechaIngre: new Date(),
              puntos: 0, // Valor inicial
            },
          ],
          miembroIds:[userId]
        };

        try {
          const clubId = await this.clubesService.createClub(newClub, userId);
          // Redirigir al club recién creado usando el ID
          this.router.navigate([`/club/${clubId}`]);
        } catch (error) {
          console.error('Error creando el club:', error);
        }
      }
    }
  }


}
