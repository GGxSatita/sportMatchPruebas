import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoAddPage } from './evento-add.page';

describe('EventoAddPage', () => {
  let component: EventoAddPage;
  let fixture: ComponentFixture<EventoAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
