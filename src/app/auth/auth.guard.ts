import { inject, Injectable } from '@angular/core';
import { CanActivateFn , Router} from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);
  const currentUser = authService.getCurrentUser(); //Obtiene el usuario actual de firebase

  if(currentUser){
    return true; //Permite el acceso a la ruta
  }else{
    router.navigate(['/login']); //redirige al login si no está autenticado
    return false; //Bloquea el acceso a la ruta
  }
};
