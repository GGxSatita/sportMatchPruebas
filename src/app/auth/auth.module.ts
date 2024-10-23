import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import{ IonicModule }from'@ionic/angular'
import { UserPerfilPage } from './pages/user-perfil/user-perfil.page';




@NgModule({
  declarations: [
    LoginComponent,
    RegistroComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,


  ]
})
export class AuthModule { }
