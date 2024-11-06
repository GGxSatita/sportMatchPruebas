import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrUsuarioPage } from './qr-usuario.page';

describe('QrUsuarioPage', () => {
  let component: QrUsuarioPage;
  let fixture: ComponentFixture<QrUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
