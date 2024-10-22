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
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage),
    canActivate:[authGuard]
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./auth/pages/editar-perfil/editar-perfil.page').then( m => m.EditarPerfilPage),
    canActivate:[authGuard]
  },
  {
    path: 'cambiar-contrasena',
    loadComponent: () => import('./auth/pages/cambiar-contrasena/cambiar-contrasena.page').then( m => m.CambiarContrasenaPage),
    canActivate:[authGuard]
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./auth/pages/recuperar-contrasena/recuperar-contrasena.page').then( m => m.RecuperarContrasenaPage)
  },
  {
    path: 'evento-list',
    loadComponent: () => import('./pages/eventos/evento-list/evento-list.page').then( m => m.EventoListPage),
    canActivate:[authGuard]
  },
  {
    path: 'evento-add',
    loadComponent: () => import('./pages/eventos/evento-add/evento-add.page').then( m => m.EventoAddPage),
    canActivate:[authGuard]
  }
  ,
  {
    path: 'match',
    loadComponent: () => import('./pages/match/match.page').then( m => m.MatchPage),
    canActivate:[authGuard]
  }
  ,
  {
    path: 'match-perfil',
    loadComponent: () => import('./pages/match-perfil/match-perfil.page').then( m=> m.MatchPerfilPage),
    canActivate:[authGuard]
  },
  {
    path: 'evento-alumno',
    loadComponent: () => import('./pages/eventos/evento-alumno/evento-alumno.page').then( m => m.EventoAlumnoPage),
    canActivate:[authGuard]

  },  {
    path: 'desafio',
    loadComponent: () => import('./pages/desafio/desafio.page').then( m => m.DesafioPage)
  },
  {
    path: 'desafio-list',
    loadComponent: () => import('./pages/desafio-list/desafio-list.page').then( m => m.DesafioListPage)
  },
  {
    path: 'enfrentamiento',
    loadComponent: () => import('./pages/enfrentamiento/enfrentamiento.page').then( m => m.EnfrentamientoPage)
  },
  {
    path: 'enfrentamiento-espera',
    loadComponent: () => import('./pages/enfrentamiento-espera/enfrentamiento-espera.page').then( m => m.EnfrentamientoEsperaPage)
  }






];
