import { TestBed } from '@angular/core/testing';

import { DesafioService } from './desafio.service';

describe('DesafioService', () => {
  let service: DesafioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesafioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
