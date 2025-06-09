import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPopupComponent } from './checkout-popup.component';

describe('CheckoutPopupComponent', () => {
  let component: CheckoutPopupComponent;
  let fixture: ComponentFixture<CheckoutPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
