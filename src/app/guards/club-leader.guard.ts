import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ClubesService } from '../services/clubes.service';
import { AutenticacionService } from '../services/autenticacion.service';


// Verificación de autenticación: Comprueba si hay un usuario autenticado.
// Obtención del club: Usa el clubId de la URL para obtener los datos del club.
// Validación de permisos: Verifica si el usuario es el creador (adminId) o el líder del club.
// Navegación: Redirige a /menu-principal si el usuario no tiene los permisos necesarios.



@Injectable({
  providedIn: 'root'
})
export class ClubLeaderGuard implements CanActivate {
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
      const clubId = next.paramMap.get('id');

      if (user && clubId) {
        const userId = user.uid;
        const club = await this.clubesService.getClubById(clubId).toPromise();

        if (club && (club.adminId === userId || club.miembros.some(m => m.userId === userId && m.role === 'lider'))) {
          // Si el usuario es el líder o creador del club, permite el acceso
          return true;
        } else {
          console.warn('Acceso denegado: No eres el líder o creador del club');
          await this.router.navigate(['/menu-principal']);
          return false;
        }
      } else {
        console.warn('Usuario no autenticado o ID de club no proporcionado');
        await this.router.navigate(['/login']);
        return false;
      }
    } catch (error) {
      console.error('Error en ClubLeaderGuard:', error);
      await this.router.navigate(['/login']);
      return false;
    }
  }
}
