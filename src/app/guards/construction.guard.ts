import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ConstructionService } from '../services/construction.service';

@Injectable({
  providedIn: 'root'
})
export class ConstructionGuard implements CanActivate {
  
  constructor(
    private constructionService: ConstructionService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    // If construction mode is disabled or user has bypassed, let them through
    if (!this.constructionService.isConstructionMode()) {
      return true;
    }
    
    // Don't redirect if we're already on the construction page
    if (this.router.url.includes('/construction')) {
      return true;
    }
    
    // Redirect to construction page
    this.router.navigate(['/construction']);
    return false;
  }
}
