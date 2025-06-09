import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  // Check if the user is logged in before allowing access to a route
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }
  }
}