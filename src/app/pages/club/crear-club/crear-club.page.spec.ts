import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearClubPage } from './crear-club.page';

describe('CrearClubPage', () => {
  let component: CrearClubPage;
  let fixture: ComponentFixture<CrearClubPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearClubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
