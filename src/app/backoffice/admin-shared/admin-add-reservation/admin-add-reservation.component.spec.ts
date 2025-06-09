import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddReservationComponent } from './admin-add-reservation.component';

describe('AdminAddReservationComponent', () => {
  let component: AdminAddReservationComponent;
  let fixture: ComponentFixture<AdminAddReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
