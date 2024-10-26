import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  IonCol, IonGrid } from '@ionic/angular/standalone';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { ClubesService } from 'src/app/services/clubes.service';
import { DeportesService } from 'src/app/services/deportes.service';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Club } from 'src/app/models/club';
import { Deporte } from 'src/app/models/deporte';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-club-edit',
  templateUrl: './club-edit.page.html',
  styleUrls: ['./club-edit.page.scss'],
  standalone: true,
  imports: [IonGrid,
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
    IonInput,
    IonTextarea,
    IonSelect,
    HeaderComponent
  ],
})
export class ClubEditPage implements OnInit {
  clubForm: FormGroup;
  deportes: Deporte[] = [];
  logoUrl: string | null = null;
  clubId: string | null = null;
  club: Club | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private clubesService: ClubesService,
    private deportesService: DeportesService,
    private storageService: StorageService,
    private route: ActivatedRoute,
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

  async ngOnInit() {
    this.clubId = this.route.snapshot.paramMap.get('id');
    if (this.clubId) {
      await this.cargarClub(this.clubId);
    }
    this.cargarDeportes();
  }

  // Método para cargar los datos del club
  async cargarClub(clubId: string) {
    this.clubesService.getClubById(clubId).subscribe((club) => {
      if (club) {
        this.club = club;
        this.logoUrl = club.logo;
        this.clubForm.patchValue({
          nombreClub: club.nombreClub,
          descripcion: club.descripcion,
          logo: club.logo,
          deporteNombre: club.deporteNombre,
          maxMiembros: club.maxMiembros,
        });
      }
    });
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
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      // Si la foto fue tomada exitosamente, asignarla
      this.logoUrl = image.webPath;
    } catch (error) {
      // Verificar si el error es una cancelación por parte del usuario
      if (error instanceof Capacitor.Exception && error.message.includes("User cancelled")) {
        console.info("Captura de foto cancelada por el usuario.");
      } else {
        console.error("Error al tomar la foto del logo:", error);
      }
    }
  }


  // Método para seleccionar una foto de la galería
  async selectLogoFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      // Si la imagen fue seleccionada exitosamente, asignarla
      this.logoUrl = image.webPath;
    } catch (error) {
      // Verificar si el error es una cancelación por parte del usuario
      if (error instanceof Capacitor.Exception && error.message.includes("User cancelled")) {
        console.info("Selección de imagen cancelada por el usuario.");
      } else {
        console.error("Error al seleccionar la imagen del logo:", error);
      }
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

  // Método para guardar los cambios del club
  async guardarCambios() {
    if (this.clubForm.valid && this.club && this.clubId) {
      const clubData = this.clubForm.value;

      const updatedClub: Partial<Club> = {
        nombreClub: clubData.nombreClub,
        logo: clubData.logo,
        descripcion: clubData.descripcion,
        maxMiembros: clubData.maxMiembros,
        deporteNombre: clubData.deporteNombre,
      };

      try {
        await this.clubesService.updateClub(this.clubId, updatedClub);
        console.log('Club actualizado correctamente');
        this.router.navigate([`/club/${this.clubId}`]);
      } catch (error) {
        console.error('Error actualizando el club:', error);
      }
    }
  }
  cancelar() {
    // Navega de regreso a la página anterior o a una ruta específica
    this.router.navigate(['/club', this.clubId]);
  }

}
