import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../models/ApiResponse.interface';
import { BACKEND_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private apiUrl = BACKEND_URL+'/api/products';
  private productsCache: Product[] | null = null; // Initialize as null
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();
  private sessionStorageKey = 'productsCache';

  private autoRefreshInterval = 86400000; // Auto-refresh every 24 hours (in milliseconds)

  constructor(private http: HttpClient) {
    // Check for expired cache on app load
    this.productsCache = this.loadCacheFromSessionStorage();
  }

  /**
   * Fetch products from the backend and update the cache and observable.
   */
  fetchProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success) return response.data; // Extract the Product array from the ApiResponse
        else throw new Error(response?.message || 'Failed to fetch products');
      }),
      tap(products => {
        console.log('Fetched products from backend:', products);
        this.productsCache = products;
        this.saveCacheToSessionStorage(products); // Save to localStorage
        this.productsSubject.next(products); // Notify subscribers
      })
    );
  }

  /**
   * Get all products
   * Uses cached products if available; otherwise fetches from the backend.
   */
  getProducts(): Observable<Product[]> {
    if (!this.productsCache) {
      console.log('Cache is empty, loading from localStorage...');
      this.productsCache = this.loadCacheFromSessionStorage();
    }

    if (this.productsCache.length === 0) {
      console.log('Cache is still empty, fetching products from backend...');
      return this.fetchProducts();
    }

    console.log('Returning cached products:', this.productsCache);
    this.productsSubject.next(this.productsCache);
    return this.products$;
  }

  /**
   * Get a single product by its ID.
   * Gets product from the saved products cache.
   */
  getProduct(productId: string): Observable<Product> {
    /* check if cache is null or not */
    if (!this.productsCache) {
      console.log('Cache is empty, loading from localStorage...');
      this.productsCache = this.loadCacheFromSessionStorage();
    }
    // if product is found in the cache, return it, otherwise fetch from backend
    const product = this.productsCache.find(p => p.productId === productId);
    if (product) {
      return new Observable<Product>(subscriber => {
        subscriber.next(product);
        subscriber.complete();
      });
    }
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${productId}`).pipe(
      map(response => {
        if (response.success) return response.data; // Extract the Product array from the ApiResponse
        else throw new Error(response.message || 'Failed to fetch products');
      })  
    );
  }
  // getProduct(productId: string): Observable<Product | undefined> {
  //   if (this.productsCache && this.productsCache.length > 0) {
  //     const product = this.productsCache.find(p => p.productId === productId);
  //     return new Observable<Product | undefined>(subscriber => {
  //       subscriber.next(product);
  //       subscriber.complete();
  //     });
  //   }
  //   return this.fetchProducts().pipe(
  //     map(products => {
  //       this.productsCache = products;
  //       return products.find(p => p.productId === productId);
  //     })
  //   );
  // }

  getProductSync(productId: string): Product | undefined {
    if (!this.productsCache || this.productsCache.length === 0) {
      this.productsCache = this.loadCacheFromSessionStorage();
    }
    return this.productsCache.find(p => p.productId === productId);
  }

  /**
   * Save cache to session storage.
   */
  private saveCacheToSessionStorage(products: Product[]): void {
    const cacheData = {
      products,
      timestamp: Date.now() // Save the current timestamp
    };
    sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(cacheData));
  }

  /**
   * Load cache from session storage.
   */
  private loadCacheFromSessionStorage(): Product[] {
    const cachedData = sessionStorage.getItem(this.sessionStorageKey);
    if (cachedData) {
      const { products, timestamp } = JSON.parse(cachedData);
  
      // Check if the cache is older than 24 hours
      if (Date.now() - timestamp > this.autoRefreshInterval) {
        console.log('Cache expired, clearing sessionStorage...');
        sessionStorage.removeItem(this.sessionStorageKey); // Clear expired cache
        return [];
      }
  
      return products;
    }
    return [];
  }
  
  getSimilarProducts(currentProduct: Product, count: number = 4): Product[] {
    if (!this.productsCache || this.productsCache.length === 0) {
      this.productsCache = this.loadCacheFromSessionStorage();
    }
  
    const similar = this.productsCache
      .filter(p => p.productId !== currentProduct.productId)
      .map(p => {
        const tags = currentProduct.tags || [];
        const pTags = p.tags || [];
  
        // Count matching tags
        const tagMatchScore = tags.filter(tag => pTags.includes(tag)).length;
  
        // Optionally: add name similarity score (basic)
        const nameSimilarity =
          p.name.toLowerCase().includes(currentProduct.name.toLowerCase()) ? 1 : 0;
  
        return { product: p, score: tagMatchScore + nameSimilarity };
      })
      .sort((a, b) => b.score - a.score)
      .map(p => p.product)
      .slice(0, count);
  
    // If we didn’t get enough, fill in with random ones
    const needed = count - similar.length;
    if (needed > 0) {
      const fallback = this.productsCache
        .filter(p => !similar.includes(p) && p.productId !== currentProduct.productId);
      while (similar.length < count && fallback.length) {
        const randomIndex = Math.floor(Math.random() * fallback.length);
        similar.push(fallback.splice(randomIndex, 1)[0]);
      }
    }
  
    return similar;
  }

}
