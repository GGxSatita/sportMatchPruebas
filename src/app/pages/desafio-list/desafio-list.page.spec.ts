import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesafioListPage } from './desafio-list.page';

describe('DesafioListPage', () => {
  let component: DesafioListPage;
  let fixture: ComponentFixture<DesafioListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DesafioListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
