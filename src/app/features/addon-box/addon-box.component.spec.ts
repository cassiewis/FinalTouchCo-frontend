import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonBoxComponent } from './addon-box.component';

describe('AddonBoxComponent', () => {
  let component: AddonBoxComponent;
  let fixture: ComponentFixture<AddonBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddonBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddonBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
