import { inject, Injectable } from '@angular/core';
import { CanActivateFn , Router} from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  try {
    const currentUser = await authService.getCurrentUserAsync(); // Usa una versión asíncrona
    if (currentUser) {
      return true; // Permite el acceso a la ruta
    } else {
      await router.navigate(['/login']); // Redirige al login si no está autenticado
      return false; // Bloquea el acceso a la ruta
    }
  } catch (error) {
    console.error('Error en authGuard:', error);
    await router.navigate(['/login']);
    return false;
  }
};
