import { TestBed } from '@angular/core/testing';

import { ReservedDatesService } from './reserved-dates.service';

describe('ReservedDatesService', () => {
  let service: ReservedDatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservedDatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
