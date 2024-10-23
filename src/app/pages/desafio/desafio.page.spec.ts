import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesafioPage } from './desafio.page';

describe('DesafioPage', () => {
  let component: DesafioPage;
  let fixture: ComponentFixture<DesafioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DesafioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
