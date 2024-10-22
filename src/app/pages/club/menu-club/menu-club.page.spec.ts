import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuClubPage } from './menu-club.page';

describe('MenuClubPage', () => {
  let component: MenuClubPage;
  let fixture: ComponentFixture<MenuClubPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuClubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
