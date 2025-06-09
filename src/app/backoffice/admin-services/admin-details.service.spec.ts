import { TestBed } from '@angular/core/testing';
import { AdminDetailsService } from './admin-details.service';

describe('AdminDetailsService', () => {
  let service: AdminDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
