import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesafiosPage } from './desafios.page';

describe('DesafiosPage', () => {
  let component: DesafiosPage;
  let fixture: ComponentFixture<DesafiosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DesafiosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
