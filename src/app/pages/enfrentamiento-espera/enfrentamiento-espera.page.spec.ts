import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnfrentamientoEsperaPage } from './enfrentamiento-espera.page';

describe('EnfrentamientoEsperaPage', () => {
  let component: EnfrentamientoEsperaPage;
  let fixture: ComponentFixture<EnfrentamientoEsperaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnfrentamientoEsperaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
