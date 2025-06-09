import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { Review } from '../../models/review.model';
import { AuthService } from '../auth.service';
import { HttpHeaders } from '@angular/common/http';
import { BACKEND_URL } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class AdminDetailsService {
  private apiUrl = BACKEND_URL+'/api/admin/details';

  constructor(private http: HttpClient, private authService: AuthService) {}

  addReview(review: Review): Observable<Review> {
    const headers = new HttpHeaders({
          'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
        });
    return this.http.post<Review>(`${this.apiUrl}/reviews`, review, { headers }).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to add review');
        }
      })
    );
  }

  deleteReview(reviewId: string): Observable<void> {
    const headers = new HttpHeaders({
          'Authorization': 'Bearer ' + this.getAdminToken() // Use a token or other method to authenticate as admin
        });
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`, { headers }).pipe(
      map((response: any) => {
        if (response.success) {
          return;
        } else {
          throw new Error(response.message || 'Failed to delete review');
        }
      })
    );
  }

  private getAdminToken(): string {
    // Retrieve the admin token from local storage or another secure place
    return this.authService.getToken() || ''; 
  }

}
