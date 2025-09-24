import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesQuoteFormComponent } from './services-quote-form.component';

describe('ServicesQuoteFormComponent', () => {
  let component: ServicesQuoteFormComponent;
  let fixture: ComponentFixture<ServicesQuoteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesQuoteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesQuoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
