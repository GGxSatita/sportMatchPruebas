import { Component, OnInit , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,IonCardContent,
        IonCardHeader, IonHeader, IonTitle,
        IonToolbar, IonButton,IonIcon,IonCard,
        IonItem, IonLabel, IonSpinner ,IonCardTitle} from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Models } from 'src/app/models/models';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-user-perfil',
  templateUrl: './user-perfil.page.html',
  styleUrls: ['./user-perfil.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonLabel, IonItem, IonButton, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule,IonLabel,IonIcon,IonCard,
    IonCardHeader,IonCardContent,IonCardTitle,
    HeaderComponent]
})
export class UserPerfilPage implements OnInit {

  autenticacionService: AutenticacionService = inject(AutenticacionService);
  firestoreService: FirestoreService = inject(FirestoreService);

  user: { email: string, name: string, photo: string };
  userProfile: Models.Auth.UserProfile;

  newName: string = '';
  newPhoto: string = '';
  newEdad: string = '';
  cargando: boolean = false;
  isEditing: boolean = false;  // Nueva propiedad para controlar el estado de edición

  constructor() {
    this.cargando = true;
    this.autenticacionService.authState.subscribe(res => {
      console.log('res --->', res);
      if (res) {
        this.user = {
          email: res.email,
          name: res.displayName,
          photo: res.photoURL ? res.photoURL : 'assets/default-profile.png' // Imagen por defecto si no hay URL
        };
        this.getDatosProfile(res.uid);
      } else {
        this.user = null;
        this.cargando = false;
      }
    });
  }

  ngOnInit() {}

  // Método para alternar el modo de edición
  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  getDatosProfile(uid: string) {
    console.log('getDatosProfile ---->', uid);
    this.firestoreService.getDocumentChanges<Models.Auth.UserProfile>(`${Models.Auth.PathUsers}/${uid}`).subscribe(res => {
      if (res) {
        this.userProfile = res;
        console.log('this.userProfile --->', this.userProfile);
      }
      this.cargando = false;
    });
  }

  async actualizarPerfil() {
    let data: Models.Auth.UpdateProfileI = {};
    if (this.newName) {
      data.displayName = this.newName;
    }
    if (this.newPhoto) {
      data.photoURL = this.newPhoto;
    }
    await this.autenticacionService.updateProfile(data);
    const user = this.autenticacionService.getCurrentUser();
    const updateData: any = {
      name: user.displayName,
      photo: user.photoURL
    };
    await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateData);
    this.user = {
      email: user.email,
      name: user.displayName,
      photo: user.photoURL ? user.photoURL : 'assets/default-profile.png' // Imagen por defecto después de actualizar
    };
    this.toggleEditMode();  // Salir del modo de edición después de actualizar
  }

  async actualizarEdad() {
    const user = this.autenticacionService.getCurrentUser();
    const updateDoc: any = {
      edad: this.userProfile.edad
    };
    await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateDoc);
    console.log('Edad actualizada con éxito');
    this.toggleEditMode();  // Salir del modo de edición después de actualizar
  }

  // Manejador de errores de carga de imagen
  handleImageError(event: any) {
    event.target.src = 'assets/img/default-profile.png'; // Cambia a imagen por defecto si hay un error
  }

  salir() {
    this.autenticacionService.logout();
  }

}
