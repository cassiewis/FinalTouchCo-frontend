import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-view.component.html',
  styleUrl: './quick-view.component.css'
})
export class QuickViewComponent {

  constructor(private productService: ProductService){}

}
