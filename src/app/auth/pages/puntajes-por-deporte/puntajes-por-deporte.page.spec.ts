import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuntajesPorDeportePage } from './puntajes-por-deporte.page';

describe('PuntajesPorDeportePage', () => {
  let component: PuntajesPorDeportePage;
  let fixture: ComponentFixture<PuntajesPorDeportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PuntajesPorDeportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
