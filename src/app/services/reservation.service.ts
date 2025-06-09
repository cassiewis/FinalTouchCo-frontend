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

  // Add a new reservation
  // addReservation(reservation: Reservation): Observable<Reservation> {
  //   const name = reservation.name.replace(/\s+/g, '');
  //   const generatedstring = Math.random().toString(36).substring(2, 10);
  //   reservation.reservationId = name + "-" + generatedstring;

  //   // set status as pending for security
  //   reservation.status = 'pending';

  //   console.log("ReservationService: adding reservation");
  //   return this.http.post<ApiResponse<Reservation>>(this.apiUrl, reservation).pipe(
  //     map(response => {
  //         if (response.success) return response.data; // Extract the Product array from the ApiResponse
  //         else throw new Error(response.message || 'Failed to fetch products');
  //       }),
  //     tap(newReservation => {
  //       console.log('Added reservation:', newReservation);
  //     })
  //   );
  // }

}