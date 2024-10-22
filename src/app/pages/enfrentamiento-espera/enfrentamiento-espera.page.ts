import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DesafioService } from 'src/app/services/desafio.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-enfrentamiento-espera',
  templateUrl: './enfrentamiento-espera.page.html',
  styleUrls: ['./enfrentamiento-espera.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class EnfrentamientoEsperaPage implements OnInit {
  eventId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private desafioService: DesafioService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    this.checkPlayers();
  }

  // Lógica para chequear si el evento está lleno
  checkPlayers() {
    if (this.eventId) {
      this.desafioService.getEventStatus(this.eventId).subscribe(status => {
        if (status === 'FULL') {
          this.router.navigate(['/enfrentamiento']);
        }
      });
    }
  }
}
