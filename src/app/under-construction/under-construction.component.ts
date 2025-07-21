import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../services/construction.service';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="construction-container">
      <div class="construction-content">
        <h1>🚧 Site Under Development 🚧</h1>
        <h2>Final Touch Decor Co.</h2>
        <p>We're currently putting the finishing touches on our new website!</p>
        <p>Our event rental services are still available - please contact us directly:</p>
        
        <div class="contact-info">
          <p>📧 Email: finaltouchdecor.co&#64;gmail.com</p>
        </div>
        
        <div class="progress-bar">
          <div class="progress" [style.width.%]="progress"></div>
        </div>
        <p class="progress-text">{{progress}}% Complete</p>
        
        <button (click)="continueToSite()" class="continue-btn">
          Continue to Site →
        </button>
        
        <p class="disclaimer">
          <small>Note: The site is functional but still in beta. Thanks for your patience!</small>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .construction-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Arial', sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
    }
    
    .construction-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      animation: pulse 2s infinite;
    }
    
    h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #ffd700;
    }
    
    .contact-info {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .progress-bar {
      width: 100%;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0 10px 0;
    }
    
    .progress {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #45a049);
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    
    .continue-btn {
      background: #ffd700;
      color: #333;
      border: none;
      padding: 15px 30px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    
    .continue-btn:hover {
      transform: scale(1.05);
      background: #ffed4e;
    }
    
    .disclaimer {
      margin-top: 20px;
      opacity: 0.8;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class UnderConstructionComponent implements OnInit {
  progress = 95; // Adjust this percentage as you make progress
  
  constructor(
    private router: Router,
    private constructionService: ConstructionService
  ) {}
  
  continueToSite() {
    // Set a flag in localStorage so they don't see this again this session
    this.constructionService.setSessionBypass();
    this.router.navigate(['/home']);
  }
  
  ngOnInit() {
    // Only check for URL parameter bypass when construction page loads
    // Don't redirect if construction mode is disabled - let the guard handle that
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('beta') === 'true') {
      this.continueToSite();
    }
  }
}
