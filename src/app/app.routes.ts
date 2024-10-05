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
  },
  {
    path: 'user-perfil',
    loadComponent: () => import('./auth/pages/user-perfil/user-perfil.page').then( m => m.UserPerfilPage),
    canActivate:[authGuard]
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./pages/editar-perfil/editar-perfil.page').then( m => m.EditarPerfilPage),
    canActivate:[authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage),
    canActivate:[authGuard]
  }
];
