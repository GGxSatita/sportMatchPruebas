import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistaUsaurioPage } from './vista-usaurio.page';

describe('VistaUsaurioPage', () => {
  let component: VistaUsaurioPage;
  let fixture: ComponentFixture<VistaUsaurioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VistaUsaurioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
