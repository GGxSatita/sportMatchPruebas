import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoAlumnoPage } from './evento-alumno.page';

describe('EventoAlumnoPage', () => {
  let component: EventoAlumnoPage;
  let fixture: ComponentFixture<EventoAlumnoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoAlumnoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
