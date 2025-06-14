import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cartNotEmptyGuard } from './cart-not-empty.guard';

describe('cartNotEmptyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => cartNotEmptyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
