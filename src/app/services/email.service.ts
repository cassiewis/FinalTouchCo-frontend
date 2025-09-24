import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from '../shared/constants';
import { map, tap } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse.interface';
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl = BACKEND_URL+'/api/email';
  
  constructor(private http: HttpClient) {}
  

  sendServiceQuoteRequest(quoteData: any, recaptchaToken: string) {
    // Implement email sending logic here

    console.log("Sending service quote request:", quoteData);
    return this.http.post<ApiResponse<any>>(this.apiUrl + '/send-service-quote', quoteData, {headers: {'X-Recaptcha-Token': recaptchaToken}}).pipe(
      map(response => {
          if (response.success) return response.data; // Extract the Product array from the ApiResponse
          else throw new Error(response.message || 'Failed to fetch products');
        }),
      tap(newReservation => {
        console.log('Added reservation:', newReservation);
      })
    );
  }
}
