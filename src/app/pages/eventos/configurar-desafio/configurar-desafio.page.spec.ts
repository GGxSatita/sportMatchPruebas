import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurarDesafioPage } from './configurar-desafio.page';

describe('ConfigurarDesafioPage', () => {
  let component: ConfigurarDesafioPage;
  let fixture: ComponentFixture<ConfigurarDesafioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurarDesafioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
