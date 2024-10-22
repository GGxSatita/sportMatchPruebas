import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ClubesService } from '../services/clubes.service';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class ClubGuard implements CanActivate {
  constructor(
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const user = await this.authService.getCurrentUser();
      console.log('Usuario obtenido en ClubGuard:', user); // Log para ver el usuario

      if (user) {
        const userId = user.uid;
        const club = await this.clubesService.getClubForUser(userId);
        console.log('Club obtenido para el usuario:', club); // Log para ver el club obtenido
        if (club) {
          return true;
        } else {
          console.warn('El usuario no pertenece a ningún club');
          await this.router.navigate(['/menu-principal']);
          return false;
        }
      } else {
        console.warn('Usuario no autenticado');
        await this.router.navigate(['/login']);
        return false;
      }
    } catch (error) {
      console.error('Error en ClubGuard:', error);
      await this.router.navigate(['/login']);
      return false;
    }
  }
}
