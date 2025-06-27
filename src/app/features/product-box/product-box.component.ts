import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { navigateWithScroll } from '../../shared/constants'; // Import the navigation function

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-box.component.html',
  styleUrl: './product-box.component.css'
})
export class ProductBoxComponent {
  @Input() product!: Product; // Accept product data as input

  constructor(private router: Router) {}

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.classList.add('loaded');
  }

  goToProduct(event: MouseEvent){
    navigateWithScroll(this.router, event, '/product/' + this.product.productId);
  }
}
