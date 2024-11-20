import { TestBed } from '@angular/core/testing';

import { EnfrentamientoService } from './enfrentamiento.service';

describe('EnfrentamientoService', () => {
  let service: EnfrentamientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnfrentamientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
