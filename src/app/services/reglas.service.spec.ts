import { TestBed } from '@angular/core/testing';

import { ReglasService } from './reglas.service';

describe('ReglasService', () => {
  let service: ReglasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReglasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
