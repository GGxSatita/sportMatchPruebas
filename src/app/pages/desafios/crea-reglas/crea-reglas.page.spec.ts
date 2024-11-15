import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreaReglasPage } from './crea-reglas.page';

describe('CreaReglasPage', () => {
  let component: CreaReglasPage;
  let fixture: ComponentFixture<CreaReglasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreaReglasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
