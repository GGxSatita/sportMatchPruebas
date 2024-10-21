import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubDetallePage } from './club-detalle.page';

describe('ClubDetallePage', () => {
  let component: ClubDetallePage;
  let fixture: ComponentFixture<ClubDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
