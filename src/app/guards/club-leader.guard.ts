import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ClubesService } from '../services/clubes.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ClubLeaderGuard implements CanActivate {
  constructor(
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const user = await this.authService.getCurrentUser();
      console.log('Usuario autenticado:', user);

      if (!user) {
        console.warn('Usuario no autenticado.');
        await this.showAlert('Error de Autenticación', 'Usuario no autenticado.');
        await this.router.navigate(['/login']);
        return false;
      }

      const clubId = next.paramMap.get('id');
      console.log('ID del club:', clubId);

      if (!clubId) {
        console.warn('ID de club no proporcionado.');
        await this.showAlert('Error', 'ID de club no proporcionado.');
        await this.router.navigate(['/menu-principal']);
        return false;
      }

      const userId = user.uid;
      console.log('ID del usuario:', userId);

      const club = await this.clubesService.getClubById(clubId).toPromise();
      console.log('Datos del club obtenidos:', club);

      if (!club) {
        console.warn('El club no existe o no se pudo cargar.');
        await this.showAlert('Error', 'El club no existe o no se pudo cargar.');
        await this.router.navigate(['/menu-principal']);
        return false;
      }

      if (club.adminId === userId || club.miembros.some(m => m.userId === userId && m.role === 'lider')) {
        console.log('Acceso permitido, el usuario es el líder o creador del club.');
        return true;
      } else {
        console.warn('Acceso denegado: No eres el líder o creador del club.');
        await this.showAlert('Acceso Denegado', 'No eres el líder o creador del club.');
        await this.router.navigate(['/menu-principal']);
        return false;
      }
    } catch (error) {
      console.error('Error en ClubLeaderGuard:', error);
      await this.showAlert('Error', 'Hubo un error al verificar el acceso.');
      await this.router.navigate(['/login']);
      return false;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
