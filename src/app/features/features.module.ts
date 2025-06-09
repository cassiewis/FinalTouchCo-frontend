import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductPageComponent } from './product-page/product-page.component';
import { CartModule } from '../cart/cart.module';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    CartModule,
    ProductPageComponent
  ]
})
export class FeaturesModule { }
