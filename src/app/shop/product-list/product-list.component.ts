import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { ProductBoxComponent } from '../../features/product-box/product-box.component';
import { LoadingIconComponent } from '../../shared/loading-icon/loading-icon.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductBoxComponent, RouterModule, LoadingIconComponent],
  providers: [ProductService],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'], // corrected from styleUrl to styleUrls
})
export class ProductListComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() loading: boolean = false;
  private imagesLoadedCount: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    
    // Wait for all images to load
    this.checkImages();
  }

  checkImages(): void {
    this.imagesLoadedCount = 0; // Reset counter

    this.products.forEach(product => {
      const img = new Image();
      img.src = product.imageUrl;

      img.onload = () => {
        this.imagesLoadedCount++;
        // If all images are loaded, set loading to false
        if (this.imagesLoadedCount === this.products.length) {
          this.loading = false;
        }
      };

      img.onerror = () => {
        this.imagesLoadedCount++; // Count failed load as completed
        if (this.imagesLoadedCount === this.products.length) {
          this.loading = false;
        }
      };
    });
  }
}
