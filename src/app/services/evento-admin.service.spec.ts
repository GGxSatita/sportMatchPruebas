import { TestBed } from '@angular/core/testing';

import { EventoAdminService } from './evento-admin.service';

describe('EventoAdminService', () => {
  let service: EventoAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventoAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
