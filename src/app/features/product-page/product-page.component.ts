import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Location } from '@angular/common';
import { CartService } from '../../services/cart-service.service';
import { ReserveComponent } from './reserve/reserve.component';
import { LoadingIconComponent } from '../../shared/loading-icon/loading-icon.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductBoxComponent } from '../product-box/product-box.component';
import { FormsModule } from '@angular/forms';
// import { AddonBoxComponent } from '../addon-box/addon-box.component';
// import { AddOnItem } from '../../models/addOnItem.model';
import { DetailsService } from '../../services/details.service';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
  standalone: true,
  imports: [FormsModule, ReserveComponent, CommonModule, ProductBoxComponent, LoadingIconComponent],
})
export class ProductPageComponent implements OnInit {
  product!: Product; // Assert that Product will always be defined
  productId: string | null = null; // Hold the current productId
  loading: boolean = true; // Add loading state
  activeTab: string = 'details';
  quantity: number = 1;
  quantities: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  selectedAddons: string[] = [];
  // addons: AddOnItem[] = [];
  
  similarProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private location: Location,
    private router: Router,
    private cartService: CartService,
    private detailsService: DetailsService
  ) {}

  ngOnInit(): void {
    console.log('Product page initialized');
    // Listen for changes in the productId paramMap (route parameters)
    this.route.paramMap.subscribe(paramMap => {
      const newProductId = paramMap.get('productId');

      if (!newProductId) {
        console.log("Cannot find ProductId");
        this.router.navigate(['/notFound']);
        return;
      }

      // If the productId has changed, update the component
      if (newProductId !== this.productId) {
        console.log("Product ID changed. Fetching new product...");
        this.productId = newProductId;
        this.loading = true;
        window.scrollTo(0, 0); // Scroll to top when the product changes

        this.productService.getProduct(this.productId).pipe(
          catchError(error => {
            console.log('Error fetching product. Rerouting to 404');
            this.router.navigate(['/notFound']);
            return of(null);
          })
        ).subscribe((product: Product | null) => {
          if (product) {
            this.product = product;
            this.similarProducts = this.productService.getSimilarProducts(product);
            this.loading = false;
          }
        });
      }
    });

      // Fetch actual add-on items
      // if (this.product.addons && this.product.addons.length > 0) {
      //   this.detailsService.getAddonsByIds(this.product.addons).subscribe((addons) => {
      //     this.addons = addons;
      //     console.log('Fetched add-ons:', this.addons);
      //   }, (error) => {
      //     console.error('Error fetching add-ons:', error);
      //   });
      // }

    console.log('Product page loaded');
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  isActiveTab(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  // isAddonAvailable(addon: AddOnItem): boolean {
  //   // Example: Only active add-ons are available
  //   return addon.active;
  // }
  
  // onToggleAddon(addon: AddOnItem): void {
  //   const id = addon.itemId;
  //   if (this.selectedAddons.includes(id)) {
  //     this.selectedAddons = this.selectedAddons.filter(aid => aid !== id);
  //   } else {
  //     this.selectedAddons.push(id);
  //   }
  // }
}
