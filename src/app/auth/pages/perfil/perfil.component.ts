import { Component, inject, OnInit } from '@angular/core';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Models } from 'src/app/models/models';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent  implements OnInit {

  autenticacionService : AutenticacionService = inject(AutenticacionService);
  firestoreService : FirestoreService = inject(FirestoreService)

  user : {email:string, name:string, photo: string}

  userProfile : Models.Auth.UserProfile;

  newName : string = '';
  newPhoto : string = '';
  newEdad : string = '';
  cargando : boolean = false;


  constructor() {
    this.cargando = true ;
    this.autenticacionService.authState.subscribe(res =>{
      console.log('res --->',res );
      if(res){
        this.user = {
          email : res.email,
          name : res.displayName,
          photo : res.photoURL
        }
        this.getDatosProfile(res.uid);
      }else {
        this.user =null;
        this.cargando = false;
      }
    })
  }

  ngOnInit() {}


  getDatosProfile(uid: string){
    console.log('getDatosProfile ---->', uid)
      this.firestoreService.getDocumentChanges<Models.Auth.UserProfile>(`${Models.Auth.PathUsers}/${uid}`).subscribe(res =>{
        if(res){
          this.userProfile = res;
          console.log('this.userProfile --->', this.userProfile)
        }
        this.cargando = false;
      });
    }

  async actualizarPerfil(){
    let data : Models.Auth.UpdateProfileI ={};
    if(this.newName){
      data.displayName = this.newName
    }
    if(this.newPhoto){
      data.photoURL = this.newPhoto
    }
    await this.autenticacionService.updateProfile(data);
    const user = this.autenticacionService.getCurrentUser();
    const updateData :any = {
      name : user.displayName,
      photo : user.photoURL
    };
    await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateData);
    this.user = {
      email : user.email,
      name : user.displayName,
      photo : user.photoURL
    }
  }
  async actualizarEdad(){
    const user = this.autenticacionService.getCurrentUser();
    const updateDoc : any = {
      edad : this.userProfile.edad
    }
    await this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${user.uid}`, updateDoc)
    console.log('actualizado con exito')
  }

  salir(){
    this.autenticacionService.logout();
  }

}
