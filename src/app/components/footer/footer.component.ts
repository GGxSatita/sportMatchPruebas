import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonFooter, IonToolbar, IonGrid, IonRow, IonCol, IonButton } from "@ionic/angular/standalone";
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonButton, IonCol, IonRow, IonGrid, IonToolbar, IonFooter, IonIcon, IonTabButton, IonTabBar, IonTabs, CommonModule, ],
})
export class FooterComponent  implements OnInit {

  constructor(private router : Router) { }

  ngOnInit() {}

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
