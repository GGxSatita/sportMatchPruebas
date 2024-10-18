import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClubesService } from 'src/app/services/clubes.service';
import { clubes } from 'src/app/models/clubes';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { DeportesService } from 'src/app/services/deportes.service';
import { Deporte } from 'src/app/models/deporte';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.page.html',
  styleUrls: ['./clubes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ClubesPage implements OnInit {

  nuevoClub: clubes = {
    nombreClub: '',
    logo: '',
    descripcion: '',
    miembros: [],
    maxMiembros: 10,
    admin: false,
    deporteNombre: [], // Aquí se almacenará el deporte seleccionado
    ranking: 0
  };

  clubes$: Observable<clubes[]>;
  deportes$: Observable<Deporte[]>;
  selectedFile: File | null = null;
  selectedDeporte: string = ''; // Variable para el deporte seleccionado

  constructor(private clubesService: ClubesService,
              private deportesService: DeportesService
  ) {}

  ngOnInit() {
    this.clubes$ = this.clubesService.getClubes();
    this.deportes$ = this.deportesService.getDeportes();
  }

  // Método para seleccionar una imagen desde la galería usando Capacitor Camera
  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

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

  async uploadFile(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, `clubes/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      this.nuevoClub.logo = downloadURL;
      console.log('URL de la imagen subida:', downloadURL);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  }

  // Agregar el club con el deporte seleccionado
  agregarClub() {
    if (this.nuevoClub.nombreClub.trim()) {
      // Asignar el deporte seleccionado al club
      this.nuevoClub.deporteNombre = [this.selectedDeporte];

      this.clubesService.addClub(this.nuevoClub).then(() => {
        console.log('Club agregado correctamente');
        this.resetFormulario();
      }).catch(error => {
        console.error('Error al agregar el club:', error);
      });
    } else {
      console.error('El nombre del club es obligatorio');
    }
  }

  resetFormulario() {
    this.nuevoClub = {
      nombreClub: '',
      logo: '',
      descripcion: '',
      miembros: [],
      maxMiembros: 10,
      admin: false,
      deporteNombre: [],
      ranking: 0
    };
    this.selectedFile = null;
    this.selectedDeporte = ''; // Resetea el deporte seleccionado
  }
}
