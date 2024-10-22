import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubListPage } from './club-list.page';

describe('ClubListPage', () => {
  let component: ClubListPage;
  let fixture: ComponentFixture<ClubListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
