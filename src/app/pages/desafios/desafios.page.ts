import { Component, OnInit } from '@angular/core';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-desafios',
  templateUrl: './desafios.page.html',
  styleUrls: ['./desafios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    IonicModule
  ]
})
export class DesafiosPage implements OnInit {
  desafios: any[] = [];

  constructor(private authService: AutenticacionService, private router: Router) {}

  ngOnInit() {
    this.loadDesafios();
  }

  loadDesafios() {
    this.authService.getDesafiosDelJugador().subscribe(data => {
      this.desafios = data;
    });
  }

  aceptarDesafio(desafioId: string) {
    this.authService.aceptarDesafio(desafioId).subscribe(() => {
      this.router.navigate(['/evento-list']);
    });
  }

  rechazarDesafio(desafioId: string) {
    this.authService.rechazarDesafio(desafioId).subscribe(() => {
      this.loadDesafios(); // Recargar la lista de desafíos
    });
  }
}

