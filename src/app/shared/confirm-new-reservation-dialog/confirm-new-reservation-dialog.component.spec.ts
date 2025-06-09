import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmNewReservationDialogComponent } from './confirm-new-reservation-dialog.component';

describe('ConfirmNewReservationDialogComponent', () => {
  let component: ConfirmNewReservationDialogComponent;
  let fixture: ComponentFixture<ConfirmNewReservationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmNewReservationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmNewReservationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
