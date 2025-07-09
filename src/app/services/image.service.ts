import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiResponse } from '../models/ApiResponse.interface';
import { BACKEND_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = BACKEND_URL+'/api/images';

  constructor(private http: HttpClient) { }

  // Fetch all image URLs with a specific cache key
  getInspoImageUrls(): Observable<string[]> {
    const cacheKey = "cacheInspoImagesKey";
    const cachedInspoImageUrls = this.getCachedImageUrls(cacheKey);
    if (cachedInspoImageUrls) {
      return of(cachedInspoImageUrls);
    } else {
      return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/inspo`).pipe(
        map(response => {
          if (response.success) return response.data; // Extract the image URLs from the ApiResponse
          else throw new Error(response.message || 'Failed to fetch image URLs');
        }),
        tap(imageUrls => this.cacheImageUrls(cacheKey, imageUrls))
      );
    }
  }

  // Fetch a single image URL by key
  getImageUrl(imageKey: string): Observable<string> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/${imageKey}`).pipe(
      map(response => {
        if (response.success) return response.data; // Extract the image URL from the ApiResponse
        else throw new Error(response.message || 'Failed to fetch image URL');
      })
    );
  }

  // Cache image URLs in local storage with a specific cache key
  private cacheImageUrls(cacheKey: string, imageUrls: string[]): void {
    sessionStorage.setItem(cacheKey, JSON.stringify(imageUrls));
  }

  // Retrieve cached image URLs from local storage with a specific cache key
  private getCachedImageUrls(cacheKey: string): string[] | null {
    const cachedImageUrls = sessionStorage.getItem(cacheKey);
    return cachedImageUrls ? JSON.parse(cachedImageUrls) : null;
  }
}