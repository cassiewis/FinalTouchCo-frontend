import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/ApiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiUrl = 'http://192.168.0.145:8080/api/admin/products'; // Admin API endpoint

  // Admin-specific product cache (includes all products)
  private localStorageKey = 'adminProductsCache'; // Key to store cache in localStorage
  private adminProductsCache: Product[] = this.loadCacheFromSessionStorage();
  private adminProductsSubject = new BehaviorSubject<Product[]>(this.adminProductsCache || []);
  adminProducts$ = this.adminProductsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Fetch all products for admin, including inactive or archived products.
   */
  fetchAdminProducts(): Observable<Product[]> {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
      });

      return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { headers }).pipe(
        map(response => {
          if (response.success) return response.data; // Extract the Product array from the ApiResponse
          else throw new Error(response.message || 'Failed to fetch products');
        }),
        tap(products => {
          console.log('Fetched admin products:', products);
          this.adminProductsCache = products; // All products for admin
          this.saveCacheToSessionStorage(products);
          this.adminProductsSubject.next(this.adminProductsCache); // Notify admin-specific subscribers
      })
      );
  }

  /**
   * Get all products
   * Uses cached products if available; otherwise fetches from the backend.
   */
  getAdminProducts(): Observable<Product[]> {
    if (this.adminProductsCache.length === 0) {
      // Fetch from backend if cache is empty
      return this.fetchAdminProducts().pipe(
        tap(products => {
          this.adminProductsCache = products;
          this.adminProductsSubject.next(this.adminProductsCache); // Notify active products
        }),
        switchMap(() => this.adminProducts$) // Return products as observable
      );
    }
    return this.adminProducts$;
  }

  /**
   * Add a new product as an admin.
   */
  addProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
    });

    return this.http.post<ApiResponse<Product>>(this.apiUrl, product, { headers }).pipe(
      map(response => {
        if (response.success) return response.data; // Extract the Product array from the ApiResponse
        else throw new Error(response.message || 'Failed to fetch products');
      }),
      tap(newProduct => {
        console.log('Added product as admin:', newProduct);
        this.adminProductsCache = []; // Clear the cache so it retrieve items from the backend
        this.adminProductsSubject.next(this.adminProductsCache); // Notify subscribers
      })
    );
  }

  /**
   * Update an existing product as an admin.
   */
  updateProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
    });

    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${product.productId}`, product, { headers }).pipe(
      map(response => {
        if (response.success) return response.data; // Extract the Product array from the ApiResponse
        else throw new Error(response.message || 'Failed to fetch products');
      }),
      tap(updatedProduct => {
        console.log('Updated product as admin:', updatedProduct);
        const index = this.adminProductsCache.findIndex(p => p.productId === updatedProduct.productId);
        if (index > -1) {
          this.adminProductsCache[index] = updatedProduct;
          this.adminProductsSubject.next([...this.adminProductsCache]);
        }
      })
    );
  }

  /**
   * Delete a product.
   */
  deleteProduct(productId: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
    });

    return this.http.delete<ApiResponse<String>>(`${this.apiUrl}/${productId}`, { headers }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message || 'Failed to delete product');
      }),
      tap(() => {
        this.adminProductsCache = this.adminProductsCache.filter(p => p.productId !== productId);
        this.adminProductsSubject.next([...this.adminProductsCache]);
      })
    );
  }

  /**
   * Save cache to localStorage.
   */
  private saveCacheToSessionStorage(products: Product[]): void {
    const cacheData = {
      products,
      timestamp: Date.now() // Save the current timestamp
    };
    sessionStorage.setItem(this.localStorageKey, JSON.stringify(cacheData));
  }

  /**
   * Load cache from localStorage.
   */
  private loadCacheFromSessionStorage(): Product[] {
    const cachedData = sessionStorage.getItem(this.localStorageKey);
    if (cachedData) {
      const { products, timestamp } = JSON.parse(cachedData);
  
      // Check if the cache is older than 1 hour (3600000 ms)
      const oneHour = 3600000;
      if (Date.now() - timestamp > oneHour) {
        console.log('Cache expired, clearing sessionStorage...');
        sessionStorage.removeItem(this.localStorageKey); // Clear expired cache
        return [];
      }
  
      return products;
    }
    return [];
  }

    private getAdminToken(): string {
        // Retrieve the admin token from local storage or another secure place
        return this.authService.getToken() || ''; 
    }
}