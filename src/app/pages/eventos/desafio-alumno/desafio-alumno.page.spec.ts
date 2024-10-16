import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesafioAlumnoPage } from './desafio-alumno.page';

describe('DesafioAlumnoPage', () => {
  let component: DesafioAlumnoPage;
  let fixture: ComponentFixture<DesafioAlumnoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DesafioAlumnoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
