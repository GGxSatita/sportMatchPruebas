import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clubLeaderGuard } from './club-leader.guard';

describe('clubLeaderGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clubLeaderGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
