import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAddProductComponent } from '../admin-shared/admin-add-product/admin-add-product.component';
import { Product } from '../../models/product.model';
import { AdminProductBoxComponent } from '../admin-shared/admin-product-box/admin-product-box.component';
import { AdminProductService } from '../admin-services/admin-product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, AdminAddProductComponent, AdminProductBoxComponent],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent {
  products: Product[] = [];
  loading: boolean = true;
  activeProducts: Product[] = [];
  inactiveProducts: Product[] = [];
  editableProduct: Product | null = null; // Holds the product being edited
  tagsInput: string = ''; // Holds the comma-separated tags input for editing

  constructor(private adminProductService: AdminProductService) {}

  ngOnInit() {
    this.adminProductService.getAdminProducts().subscribe(products => {
      this.products = products;

      // Filter products into active and inactive categories
      this.activeProducts = this.products.filter(product => product.active);
      this.inactiveProducts = this.products.filter(product => !product.active);

      this.loading = false; // Set loading to false only after filtering
    });
  }

  refreshProducts(): void {
    console.log("refreshed");
    this.adminProductService.fetchAdminProducts().subscribe(
      (products: Product[]) => {
        console.log("Products refreshed:", products);
        this.products = products;

        // Re-filter products into active and inactive categories
        this.activeProducts = this.products.filter(product => product.active);
        this.inactiveProducts = this.products.filter(product => !product.active);
      },
      (error) => {
        console.error("Error refreshing products:", error);
      }
    );
  }

  openProductEditor(product: Product): void {
    this.editableProduct = { ...product }; // Clone the product for editing
    this.tagsInput = this.editableProduct.tags?.join(', ') || ''; // Convert tags to a comma-separated string
  }

  closeProductEditor(): void {
    this.editableProduct = null; // Close the editor
    this.tagsInput = ''; // Reset the tags input
  }

  saveProduct(): void {
    if (this.editableProduct) {
      // Parse the tags input into a list of strings
      this.editableProduct.tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag); // Remove empty tags

      // Call the service to save the updated product
      this.adminProductService.updateProduct(this.editableProduct).subscribe(
        updatedProduct => {
          console.log('Product updated:', updatedProduct);

          // Update the product in the local list
          const index = this.products.findIndex(p => p.productId === updatedProduct.productId);
          if (index > -1) {
            this.products[index] = updatedProduct;

            // Re-filter products into active and inactive categories
            this.activeProducts = this.products.filter(product => product.active);
            this.inactiveProducts = this.products.filter(product => !product.active);
          }

          this.closeProductEditor(); // Close the editor
        },
        error => {
          console.error('Error updating product:', error);
        }
      );
    }
  }
}