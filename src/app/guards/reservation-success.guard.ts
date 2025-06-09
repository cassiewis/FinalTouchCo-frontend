import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ReservationSuccessGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check for a flag in sessionStorage or a service
    if (sessionStorage.getItem('reservationSuccess') === 'true') {
      // Remove the flag so user can't refresh and stay on the page
      sessionStorage.removeItem('reservationSuccess');
      return true;
    }
    // Otherwise, redirect to home or cart
    this.router.navigate(['/cart']);
    return false;
  }
}