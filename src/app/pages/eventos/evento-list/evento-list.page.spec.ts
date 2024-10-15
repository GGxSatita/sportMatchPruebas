import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoListPage } from './evento-list.page';

describe('EventoListPage', () => {
  let component: EventoListPage;
  let fixture: ComponentFixture<EventoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
