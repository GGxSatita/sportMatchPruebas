import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { DesafioService } from 'src/app/services/desafio.service';
import { Desafio } from 'src/app/models/desafio';
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from "../../components/header/header.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-desafio-list',
  templateUrl: './desafio-list.page.html',
  styleUrls: ['./desafio-list.page.scss'],
  standalone: true,
  imports: [IonFabList, IonFabButton, IonFab, IonIcon, IonCardTitle, IonCardHeader, IonCard, IonCol, IonRow, IonGrid, IonLabel, IonItem, IonList, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent, HeaderComponent]
})
export class DesafioListPage implements OnInit {
  desafios: Desafio[] = [];
  desafiosExpandido: { [key: string]: boolean } = {};
  constructor(private desafiosServicio: DesafioService, private router : Router) { }

  ngOnInit() {
    this.loadDesafios();
  }
  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
  loadDesafios() {
    this.desafiosServicio.getDesafios().subscribe(data => {
      this.desafios = data;
    });
  }
  toggleDesafioExpandido(id: string) {
    this.desafiosExpandido[id] = !this.desafiosExpandido[id];
  }

}
