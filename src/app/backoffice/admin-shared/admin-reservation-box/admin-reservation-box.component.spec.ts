import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReservationBoxComponent } from './admin-reservation-box.component';

describe('AdminReservationBoxComponent', () => {
  let component: AdminReservationBoxComponent;
  let fixture: ComponentFixture<AdminReservationBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReservationBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReservationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
