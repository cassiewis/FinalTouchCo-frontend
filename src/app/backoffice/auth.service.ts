import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://192.168.0.145:8080/api/auth/login';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private router: Router) {}

  // Authenticate the user and store the token in local storage
  login(username: string, password: string): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ token: string }>(this.apiUrl, { username, password }, { headers }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // Check if this.tokenKey is present and not expired
  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return false;
    }
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) <= expiry;
  }

  // log the user out by removing the token from local storage
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    // localStorage.remoteItem("");
    this.router.navigate(['/login']);
    console.log('AuthService: loggedout');
  }

  // get the specified token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}