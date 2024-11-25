import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnfrentamientoEquiposPage } from './enfrentamiento-equipos.page';

describe('EnfrentamientoEquiposPage', () => {
  let component: EnfrentamientoEquiposPage;
  let fixture: ComponentFixture<EnfrentamientoEquiposPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnfrentamientoEquiposPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
