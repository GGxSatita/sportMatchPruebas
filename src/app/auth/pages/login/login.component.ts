import { Component, inject, OnInit } from '@angular/core';
import { Models } from 'src/app/models/models';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: Models.Auth.DatosLogin;

  autenticacionService: AutenticacionService = inject(AutenticacionService);


  user: { email: string; name: string };

  constructor() {
    this.initForm();

    //este metodo nos permite estar suscritos a los cambios que tenga nuestro usuario
    //ya sea que hizo login , logout o cualquier otro cambio

    this.autenticacionService.authState.subscribe((res) => {
      console.log('res ->', res);
      if (res) {
        this.user = {
          email: res.email,
          name: res.displayName,
        };
      } else {
        this.user = null;
      }
      const user = this.autenticacionService.getCurrentUser();
      console.log('currentUser ->', user);
    });
  }

  ngOnInit() {}

  // login(){
  //   const data = {
  //     email : 'prueba1@gmail.com',
  //     password : '123456'
  //   }
  //   this.autenticacionService.login(data.email, data.password)
  // }

  //inicia el formulario
  initForm() {
    this.form = {
      email: '',
      password: '',
    };
  }

  async login() {
    if (this.form?.email && this.form?.password) {
      try{
        await this.autenticacionService.login(this.form.email, this.form.password);
      }catch(error){
        console.log('Error ---->', error)
        //agregar algun mensaje de que las credenciales estan mal aquí
      }

    }
  }

  salir() {
    this.autenticacionService.logout();
  }
}
