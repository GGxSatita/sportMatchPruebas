import { TestBed } from '@angular/core/testing';

import { SectoresService } from './sectores.service';

describe('SectoresService', () => {
  let service: SectoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SectoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
