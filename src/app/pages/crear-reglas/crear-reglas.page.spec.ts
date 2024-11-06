import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReglasPage } from './crear-reglas.page';

describe('CrearReglasPage', () => {
  let component: CrearReglasPage;
  let fixture: ComponentFixture<CrearReglasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearReglasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
