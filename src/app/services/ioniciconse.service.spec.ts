import { TestBed } from '@angular/core/testing';

import { IoniciconseService } from './ioniciconse.service';

describe('IoniciconseService', () => {
  let service: IoniciconseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IoniciconseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
