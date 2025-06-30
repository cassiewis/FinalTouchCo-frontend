import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { ApiResponse } from '../models/ApiResponse.interface'; 
import { BACKEND_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ReservedDatesService {

  private apiUrl = BACKEND_URL+'/api/reservedDates'; // Replace with your backend API URL if different

  constructor(private http: HttpClient) { }

  // Fetch all reserved dates
  getAllReservedDates(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }

  // Fetch reserved dates for a specific product
  getReservedDatesByProductId(productId: string): Observable<Date[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/dates/${productId}`).pipe(
      map((response) => {
        if (response.success) {
          // Extract the data (array of date strings) and convert them to Date objects
          return response.data.map(datestring => new Date(datestring));
        } else {
          // Throw an error if the response indicates failure
          throw new Error(response.message || 'Failed to fetch reserved dates');
        }
      })
    );
  }

  getReservedProductsByDate(date: Date): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/productIds/${date.toISOString()}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data; // Return the array of product IDs
        } else {
          throw new Error(response.message || 'Failed to fetch reserved products for date');
        }
      })
    );
  }
}


// ReservedDate model (you can move this to a separate file if needed)
export interface ReservedDate {
  productId: string;
  date: string;
  reservationId?: string;
  status?: string;
}