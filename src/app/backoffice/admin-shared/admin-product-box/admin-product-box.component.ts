import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminProductService } from '../../admin-services/admin-product.service';
import { MATERIALS, EVENT_TYPES, CATEGORIES, COLORS } from '../../../shared/constants';

@Component({
  selector: 'app-admin-product-box',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './admin-product-box.component.html',
  styleUrl: './admin-product-box.component.css'
})
export class AdminProductBoxComponent {
  @Input() product!: Product;
  @Input() numReservations!: number;

  tagsInput: string = '';
  editMode: boolean = false;
  editableProduct!: Product;
  showCalendar: boolean = false;

  eventTypes = EVENT_TYPES;
  categories = CATEGORIES;
  materials = MATERIALS;
  colors = COLORS;

  constructor(
    private productService: ProductService,
    private adminProductService: AdminProductService
  ) {}

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  dateClass = (date: Date): string => {
    if (!this.product.datesReserved || this.product.datesReserved.length === 0) return '';
    const reservedDates = this.product.datesReserved.map(d => new Date(d));
    const isReserved = reservedDates.some(d => d.toDateString() === date.toDateString());
    return isReserved ? 'reserved-date' : '';
  };

  openProductEditor() {
    // Deep copy to avoid mutating the original product
    this.editableProduct = { ...this.product };
    this.editMode = true;
    // Initialize tags array if it doesn't exist
    if (!this.editableProduct.tags) {
      this.editableProduct.tags = [];
    }
    this.tagsInput = this.editableProduct.tags?.join(', ') || '';
  }

  // Check if a tag is selected
  isTagSelected(tag: string): boolean {
    return this.editableProduct.tags?.includes(tag) || false;
  }

  // Toggle tag selection
  toggleTag(tag: string, isChecked: boolean): void {
    if (!this.editableProduct.tags) {
      this.editableProduct.tags = [];
    }
    
    if (isChecked) {
      // Add tag if not already present
      if (!this.editableProduct.tags.includes(tag)) {
        this.editableProduct.tags.push(tag);
      }
    } else {
      // Remove tag
      this.editableProduct.tags = this.editableProduct.tags.filter(t => t !== tag);
    }
  }

  saveProduct() {
    // Tags are already managed through the checkbox toggles
    // No need to parse from tagsInput anymore
    
    // Ensure productId is not changed
    this.editableProduct.productId = this.product.productId;

    // Update the fields of the original product object
    Object.assign(this.product, this.editableProduct);

    console.log("updating product: " + this.editableProduct);

    this.adminProductService.updateProduct(this.product).subscribe(
      (response: Product) => {
        console.log('Product updated successfully:', response);
      },
      (error: any) => {
        console.error('Error updating product:', error);
      }
    );

    this.editMode = false;
    this.tagsInput = '';
  }

  closeProductEditor() {
    this.editMode = false;
    this.tagsInput = '';
  }

  deleteProduct() {
    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      this.adminProductService.deleteProduct(this.product.productId).subscribe(
        () => {
          console.log('Product deleted:', this.product.productId);
        },
        (error: any) => {
          console.error('Error deleting product:', error);
        }
      );
    }
  }
}