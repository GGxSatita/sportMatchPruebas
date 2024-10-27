import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubEliminarPage } from './club-eliminar.page';

describe('ClubEliminarPage', () => {
  let component: ClubEliminarPage;
  let fixture: ComponentFixture<ClubEliminarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubEliminarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
