import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubEditPage } from './club-edit.page';

describe('ClubEditPage', () => {
  let component: ClubEditPage;
  let fixture: ComponentFixture<ClubEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
