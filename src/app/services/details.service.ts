import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { Review } from '../models/review.model';
import { AddOnItem } from '../models/addOnItem.model';
import { BlockoutDate } from '../models/blockoutDates';
import { BACKEND_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  private apiUrl = BACKEND_URL+'/api/details';

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

  getAllBlockoutDates(): Observable<Date[]> {
    return this.http.get<string[]>(`${this.apiUrl}/blockoutdates`).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch blockout dates');
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
