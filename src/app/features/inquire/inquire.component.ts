import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { EmailService } from '../../services/email.service';
import { RECAPTCHA_SITE_KEY } from '../../shared/constants';

declare var grecaptcha: any;

@Component({
  selector: 'app-inquire',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inquire.component.html',
  styleUrl: './inquire.component.css'
})
export class InquireComponent implements OnInit {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  prefilledProduct = '';

  constructor(
    private emailService: EmailService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Load reCAPTCHA script if not already loaded
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Check for query parameters and prefill product information
    this.route.queryParams.subscribe(params => {
      if (params['product']) {
        const productName = params['product'];
        const price = params['price'];
        
        this.prefilledProduct = price 
          ? `${productName} ($${price})`
          : productName;
      }
    });
  }

  async onSubmit(form: any) {
    // Check if form is valid
    if (form.invalid) {
      // Mark form as submitted to show validation errors
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      // Generate reCAPTCHA token
      const recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit_inquiry' });
      
      // Get form data
      const formElement = document.querySelector('form') as HTMLFormElement;
      const formData = new FormData(formElement);
      
      const inquiryData = {
        name: formData.get('name'),
        email: formData.get('email'),
        eventType: formData.get('event-type'),
        eventDate: formData.get('event-date'),
        venue: formData.get('venue'),
        products: formData.get('products'),
        deliveryOptions: formData.getAll('delivery'),
        message: formData.get('message'),
        hearAboutUs: formData.get('hear-about-me'),
      };

      await this.sendEmail(inquiryData, recaptchaToken);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      this.errorMessage = 'Failed to send your inquiry. Please try again.';
      this.isSubmitting = false;
    }
  }

  private async sendEmail(inquiryData: any, recaptchaToken: string) {
    try {
      await this.emailService.sendInquiry(inquiryData, recaptchaToken).toPromise();
      
      this.successMessage = 'Your inquiry has been submitted! We\'ll get back to you within 3 business days.';
      
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      form?.reset();
      
    } catch (error: any) {
      console.error('Error sending email:', error);
      this.errorMessage = error.message || 'Failed to send your inquiry. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
