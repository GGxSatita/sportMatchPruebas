import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnfrentamientoPage } from './enfrentamiento.page';

describe('EnfrentamientoPage', () => {
  let component: EnfrentamientoPage;
  let fixture: ComponentFixture<EnfrentamientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnfrentamientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
