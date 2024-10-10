import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchPerfilPage } from './match-perfil.page';

describe('MatchPerfilPage', () => {
  let component: MatchPerfilPage;
  let fixture: ComponentFixture<MatchPerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchPerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
