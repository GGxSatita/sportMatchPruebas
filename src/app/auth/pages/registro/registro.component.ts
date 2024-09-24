import { Component, inject, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { FormBuilder, Validators , FormGroup, FormControl} from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import {FirestoreService} from './../../../services/firestore.service'
import { Models } from 'src/app/models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  firestoreService : FirestoreService = inject(FirestoreService)
  autenticacionService: AutenticacionService = inject(AutenticacionService);
  router : Router = inject(Router)

  //Formulario
  datosForm = this.fb.group({
    email: ['',[ Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    photo : ['', Validators.required],
    edad :[null, [Validators.required, Validators.min(16), Validators.max(99)]]
  });

  cargando: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}

  async registrarse() {
    this.cargando = true;
    console.log('DATOS FORMULARIO ->', this.datosForm.value);
    if (this.datosForm.valid) {
      const data = this.datosForm.value;
      console.log('VALIDOOOOOOOOO ->', data);
      try {
        const res = await this.autenticacionService.createUser(data.email, data.password)
        let profile : Models.Auth.UpdateProfileI ={
          displayName:data.name,
          photoURL: data.photo
        };
        await this.autenticacionService.updateProfile(profile);
        const datosUser: Models.Auth.UserProfile = {
          name: data.name,
          photo : data.photo,
          edad : data.edad,
          id: res.user.uid,
          email : data.email
        }
        console.log('Datos user ---->',datosUser);
        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, res.user.uid);
        console.log('usuario creado con éxito');
        this.router.navigate(['/login'])
      } catch (error) {
        console.log('REGISTRARSE ERROOOOOOOOR ->',error);
      }
    }
    this.cargando = false;
  }


}
