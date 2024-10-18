import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubesPage } from './clubes.page';

describe('ClubesPage', () => {
  let component: ClubesPage;
  let fixture: ComponentFixture<ClubesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
