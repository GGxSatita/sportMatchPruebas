import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ClubesService } from '../services/clubes.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ClubCreationGuard implements CanActivate {
  constructor(
    private clubesService: ClubesService,
    private authService: AutenticacionService,
    private router: Router,
    private alertController: AlertController // Inyectar AlertController
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = await this.authService.getCurrentUser();

    if (user) {
      const userId = user.uid;
      const club = await this.clubesService.getClubForUser(userId);

      if (club) {
        // El usuario ya pertenece a un club, mostrar alert y redirigir
        await this.showAlert();
        await this.router.navigate(['/menu-principal']);
        return false;
      } else {
        // El usuario no pertenece a ningún club, permitir el acceso
        return true;
      }
    } else {
      // Si no hay usuario autenticado, redirigir al login
      console.warn('Usuario no autenticado, redirigiendo al login');
      await this.router.navigate(['/login']);
      return false;
    }
  }

  private async showAlert() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'Ya perteneces a un club, no puedes crear otro.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
