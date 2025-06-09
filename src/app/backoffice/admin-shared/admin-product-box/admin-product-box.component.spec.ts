import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductBoxComponent } from './admin-product-box.component';

describe('AdminProductBoxComponent', () => {
  let component: AdminProductBoxComponent;
  let fixture: ComponentFixture<AdminProductBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
