import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { reservationSuccessGuard } from './reservation-success.guard';

describe('reservationSuccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => reservationSuccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
