import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCreadorPage } from './qr-creador.page';

describe('QrCreadorPage', () => {
  let component: QrCreadorPage;
  let fixture: ComponentFixture<QrCreadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCreadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
