import { TestBed } from '@angular/core/testing';

import { NotificacionNativaService } from './notificacion-nativa.service';

describe('NotificacionNativaService', () => {
  let service: NotificacionNativaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionNativaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
