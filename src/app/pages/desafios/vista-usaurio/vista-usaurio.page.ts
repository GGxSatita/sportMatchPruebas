import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-vista-usaurio',
  templateUrl: './vista-usaurio.page.html',
  styleUrls: ['./vista-usaurio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,HeaderComponent, FooterComponent,IonButton,IonGrid,
    IonCol, IonRow
  ]
})
export class VistaUsaurioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
