import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation.model';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse.interface';
import { BACKEND_URL } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = BACKEND_URL+'/api/reservations';

  constructor(private http: HttpClient) {}

  // Add a new reservation
  addReservation(reservation: Reservation, recaptchaToken: string): Observable<Reservation> {
    const name = reservation.name.replace(/\s+/g, '');
    const generatedstring = Math.random().toString(36).substring(2, 10);
    reservation.reservationId = name + "-" + generatedstring;

    reservation.status = 'pending';

    console.log("ReservationService: adding reservation");
    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, reservation, {headers: {'X-Recaptcha-Token': recaptchaToken}}).pipe(
      map(response => {
          if (response.success) return response.data; // Extract the Product array from the ApiResponse
          else throw new Error(response.message || 'Failed to fetch products');
        }),
      tap(newReservation => {
        console.log('Added reservation:', newReservation);
      })
    );
  }

  // Send email verification code
  sendVerificationCode(email: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${BACKEND_URL}/api/email/send-verification`, { email }).pipe(
      map(response => {
        if (response.success) return response.data;
        else throw new Error(response.message || 'Failed to send verification code');
      })
    );
  }

  // Verify email code
  verifyEmailCode(email: string, code: string): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${BACKEND_URL}/api/email/verify-code`, { email, code }).pipe(
      map(response => {
        if (response.success) return response.data;
        else throw new Error(response.message || 'Failed to verify code');
      })
    );
  }
}