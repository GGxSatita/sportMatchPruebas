import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { ClubGuard } from './guards/club.guard';
import { ClubCreationGuard } from './guards/club-creation.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'menu-principal',
    loadComponent: () => import('./pages/menu-principal/menu-principal.page').then(m => m.MenuPrincipalPage),
    canActivate: [authGuard]
  },
  {
    path: 'user-perfil',
    loadComponent: () => import('./auth/pages/user-perfil/user-perfil.page').then(m => m.UserPerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage),
    canActivate: [authGuard]
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./auth/pages/editar-perfil/editar-perfil.page').then(m => m.EditarPerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'cambiar-contrasena',
    loadComponent: () => import('./auth/pages/cambiar-contrasena/cambiar-contrasena.page').then(m => m.CambiarContrasenaPage),
    canActivate: [authGuard]
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./auth/pages/recuperar-contrasena/recuperar-contrasena.page').then(m => m.RecuperarContrasenaPage)
  },
  {
    path: 'evento-list',
    loadComponent: () => import('./pages/eventos/evento-list/evento-list.page').then(m => m.EventoListPage),
    canActivate: [authGuard]
  },
  {
    path: 'evento-add',
    loadComponent: () => import('./pages/eventos/evento-add/evento-add.page').then(m => m.EventoAddPage),
    canActivate: [authGuard]
  },
  {
    path: 'match',
    loadComponent: () => import('./pages/match/match.page').then(m => m.MatchPage),
    canActivate: [authGuard]
  },
  {
    path: 'match-perfil',
    loadComponent: () => import('./pages/match-perfil/match-perfil.page').then(m => m.MatchPerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'evento-alumno',
    loadComponent: () => import('./pages/eventos/evento-alumno/evento-alumno.page').then(m => m.EventoAlumnoPage),
    canActivate: [authGuard]
  },
  {
    path: 'crear-club',
    loadComponent: () => import('./pages/club/crear-club/crear-club.page').then(m => m.CrearClubPage),
    canActivate: [authGuard, ClubCreationGuard]
  },
  {
    path: 'club/:id',
    loadComponent: () => import('./pages/club/club/club.page').then(m => m.ClubPage),
    canActivate: [authGuard, ClubGuard],
  },
  {
    path: 'club-list',
    loadComponent: () => import('./pages/club/club-list/club-list.page').then(m => m.ClubListPage),
    canActivate: [authGuard] // Agregar guard para asegurar autenticación
  },
  {
    path: 'club-detalle/:id',
    loadComponent: () => import('./pages/club/club-detalle/club-detalle.page').then( m => m.ClubDetallePage),
    canActivate:[authGuard]
  },
  {
    path: 'enfrentamiento', loadComponent: () => import('./pages/enfrentamiento/enfrentamiento.page').then(m => m.EnfrentamientoPage),
    canActivate: [authGuard]
  },
  {
    path: 'enfrentamiento-equipos',
    loadComponent: () => import('./pages/enfrentamiento-equipos/enfrentamiento-equipos.page').then( m => m.EnfrentamientoEquiposPage),
    canActivate: [authGuard]
  },
  {
    path: 'enfrentamiento-espera',
    loadComponent: () => import('./pages/enfrentamiento-espera/enfrentamiento-espera.page').then( m => m.EnfrentamientoEsperaPage),
    canActivate: [authGuard]
  },
  {
    path: 'club-miembros/:id',
    loadComponent: () => import('./pages/club/club-miembros/club-miembros.page').then( m => m.ClubMiembrosPage),
    canActivate: [authGuard]
  },
      {
    path: 'menu-club',
    loadComponent: () => import('./pages/club/menu-club/menu-club.page').then( m => m.MenuClubPage),
    canActivate: [authGuard]
  },
  {
    path: 'lector',
    loadComponent: () => import('./pages/eventos/lector/lector.page').then( m => m.LectorPage),
    canActivate: [authGuard]
  },
   {
    path: 'club-eliminar/:id',
    loadComponent: () => import('./pages/club/club-eliminar/club-eliminar.page').then( m => m.ClubEliminarPage),
    canActivate:[authGuard]
  },
   {
    path: 'club-edit/:id',
    loadComponent: () => import('./pages/club/club-edit/club-edit.page').then( m => m.ClubEditPage),
    canActivate:[authGuard]
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones.page').then( m => m.NotificacionesPage),
    canActivate:[authGuard]
  },
  {
    path: 'weather',
    loadComponent: () => import('./pages/weather/weather.page').then( m => m.WeatherPage),
    canActivate:[authGuard]
  },
  {
    path: 'crea-reglas',
    loadComponent: () => import('./pages/desafios/crea-reglas/crea-reglas.page').then( m => m.CreaReglasPage),
    canActivate:[authGuard]
  },
  {
    path: 'qr-creador',
    loadComponent: () => import('./pages/desafios/qr-creador/qr-creador.page').then( m => m.QrCreadorPage),
    canActivate:[authGuard]
  },
  {
    path: 'qr-usuario',
    loadComponent: () => import('./pages/desafios/qr-usuario/qr-usuario.page').then( m => m.QrUsuarioPage),
    canActivate:[authGuard]
  },
  {
    path: 'vista-usaurio',
    loadComponent: () => import('./pages/desafios/vista-usaurio/vista-usaurio.page').then( m => m.VistaUsaurioPage),
    canActivate:[authGuard]
  },
  {
    path: 'puntajes-por-deporte',
    loadComponent: () => import('./auth/pages/puntajes-por-deporte/puntajes-por-deporte.page').then( m => m.PuntajesPorDeportePage),
    canActivate: [authGuard]
  },















];
