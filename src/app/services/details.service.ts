import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { Review } from '../models/review.model';
import { AddOnItem } from '../models/addOnItem.model';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  private apiUrl = 'http://192.168.0.145:8080/api/details';

  constructor(private http: HttpClient) {}

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch reviews');
        }
      })
    );
  }

  getAddonById(id: string): Observable<AddOnItem> {
    console.log(`Fetching add-on with ID: ${id}`); // Log the request
    return this.http.get<AddOnItem>(`${this.apiUrl}/addons/${id}`).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch add-ons');
        }
      })
    );
  }

  getAddonsByIds(ids: string[]): Observable<AddOnItem[]> {
    return forkJoin(ids.map(id => this.getAddonById(id))).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch add-ons');
        }
      })
    );
  }

}
