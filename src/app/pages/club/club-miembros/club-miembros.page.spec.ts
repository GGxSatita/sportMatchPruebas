import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubMiembrosPage } from './club-miembros.page';

describe('ClubMiembrosPage', () => {
  let component: ClubMiembrosPage;
  let fixture: ComponentFixture<ClubMiembrosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubMiembrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
