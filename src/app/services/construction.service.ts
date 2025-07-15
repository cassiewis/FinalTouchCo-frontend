import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstructionService {
  // 🔧 MAIN TOGGLE: Set to false to disable construction page completely
  private constructionMode = true; 
  
  /*
   * 🚀 HOW TO USE:
   * 
   * 1. DISABLE CONSTRUCTION: Set constructionMode = false
   * 2. ENABLE CONSTRUCTION: Set constructionMode = true  
   * 3. TESTERS CAN BYPASS: Click "Continue to Site" button or use ?beta=true
   * 4. ADMIN BYPASS: Add ?admin=true to URL
   * 5. CLEAR BYPASSES: Call clearSessionBypass() or clearAdminBypass() methods
   */
  
  isConstructionMode(): boolean {
    // If construction mode is disabled globally, always return false
    if (!this.constructionMode) {
      return false;
    }
    
    // Check for admin bypass
    const adminBypass = localStorage.getItem('adminBypass') === 'true';
    if (adminBypass) {
      return false;
    }
    
    // Check for session bypass (when user clicked "Continue to Site")
    const sessionBypass = localStorage.getItem('bypassConstruction') === 'true';
    if (sessionBypass) {
      return false;
    }
    
    // Check for URL parameter bypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      this.setAdminBypass();
      return false;
    }
    
    if (urlParams.get('beta') === 'true') {
      this.setSessionBypass();
      return false;
    }
    
    return true;
  }
  
  // Method to programmatically enable/disable (useful for admin controls)
  setConstructionMode(enabled: boolean): void {
    this.constructionMode = enabled;
  }
  
  // Method to bypass for admins/developers
  setAdminBypass(): void {
    localStorage.setItem('adminBypass', 'true');
  }
  
  // Method to bypass for current session (when user clicks "Continue to Site")
  setSessionBypass(): void {
    localStorage.setItem('bypassConstruction', 'true');
  }
  
  // Method to clear admin bypass
  clearAdminBypass(): void {
    localStorage.removeItem('adminBypass');
  }
  
  // Method to clear session bypass
  clearSessionBypass(): void {
    localStorage.removeItem('bypassConstruction');
  }
}
