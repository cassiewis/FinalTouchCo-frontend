import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBlockoutDates } from './admin-blockout-dates';

describe('AdminBlockoutDates', () => {
  let component: AdminBlockoutDates;
  let fixture: ComponentFixture<AdminBlockoutDates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBlockoutDates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBlockoutDates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
