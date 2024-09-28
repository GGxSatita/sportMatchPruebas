import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { authGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Login
  { path: 'registro', component: RegistroComponent }, // Registro
  { path: 'perfil', component: PerfilComponent , canActivate:[authGuard]}, // Perfil
  {path : '', redirectTo : 'login', pathMatch: 'full'} //redirige al login por defecto
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
