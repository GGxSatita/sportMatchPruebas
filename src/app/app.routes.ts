import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'menu-principal',
    loadComponent: () => import('./pages/menu-principal/menu-principal.page').then( m => m.MenuPrincipalPage),
    canActivate :[authGuard]
  }
];
