import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clubCreationGuard } from './club-creation.guard';

describe('clubCreationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clubCreationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
