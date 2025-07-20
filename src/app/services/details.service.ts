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

  getFeaturedReviews(): Review[] {
    const reviews: Review[] = [
      {
        id: '1',
        author: 'Danielle',
        rating: 5,
        content: 'Loved working with Cassie!! She made a mirror welcome sign for my wedding and it turned out so good! I got so many compliments on it! Thank you Cassie and I will definitely be using her again for other events!',
        event: "Wedding",
        date: '5/18/25'
      },
      {
        id: '2',
        author: 'Rebeca',
        rating: 5,
        content: 'Cassie is incredibly talented and such a joy to work with! I had the pleasure of renting from her in December and again this July, and both times were a breeze. She makes the whole process so easy, and her rentals are absolutely adorable!❤️',
        event: "Wedding",
        date: '7/19/25'
      },
      {
        id: '3',
        author: 'Sammie',
        rating: 5,
        content: 'Cassie created a beautiful fabric sign that I was honored to have hanging during my Engagement Party! We got so many wonderful photos in front of it and I hope to use it again for my wedding!',
        event: "Engagement Party",
        date: '7/18/25'
      }
    ];
    return reviews;
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
