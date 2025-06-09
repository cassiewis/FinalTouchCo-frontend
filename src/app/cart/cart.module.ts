import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Make sure this is included
import { CartComponent } from './cart-page/cart-page.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CartComponent,
    // This is essential for ngIf and ngFor to work
  ],
  exports: [CartComponent]  // Optional: if you want to use this component in other modules
})
export class CartModule { }
