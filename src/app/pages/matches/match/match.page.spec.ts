import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MATCHPage } from './match.page';

describe('MATCHPage', () => {
  let component: MATCHPage;
  let fixture: ComponentFixture<MATCHPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MATCHPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
