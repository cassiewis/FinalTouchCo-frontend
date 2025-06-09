import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-box.component.html',
  styleUrl: './product-box.component.css'
})
export class ProductBoxComponent {
  @Input() product!: Product; // Accept product data as input

  constructor(private router: Router) {}

  goToProductPage(): void {
    this.router.navigate(['/product', this.product.productId]).then(() => {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.classList.add('loaded');
  }
}
