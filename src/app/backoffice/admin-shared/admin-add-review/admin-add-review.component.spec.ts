import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddReviewComponent } from './admin-add-review.component';

describe('AdminAddReviewComponent', () => {
  let component: AdminAddReviewComponent;
  let fixture: ComponentFixture<AdminAddReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
