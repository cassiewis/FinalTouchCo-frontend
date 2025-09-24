import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { EmailService } from '../../../services/email.service';
import { CommonModule } from '@angular/common';
declare var grecaptcha: any;

@Component({
  selector: 'app-services-quote-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './services-quote-form.component.html',
  styleUrl: './services-quote-form.component.css'
})
export class ServicesQuoteFormComponent {

  quoteForm!: FormGroup;

  constructor(private fb: FormBuilder, private emailService: EmailService) {
    this.quoteForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        address: ['', Validators.required],
        eventDate: ['', Validators.required],
        items: ['', Validators.required],
        times: ['', Validators.required],
        recaptchaToken: ['']
      });
    }

    submitForm() {
      if (this.quoteForm.valid) {
        // send email
        this.emailService.sendServiceQuoteRequest(this.quoteForm.value, this.quoteForm.get('recaptchaToken')?.value).subscribe(
          response => {
            // Handle successful response
            console.log('Email sent successfully:', response);
          },
          error => {
            // Handle error response
            console.error('Error sending email:', error);
          }
        );
        // Handle form submission
        console.log('Form submitted:', this.quoteForm.value);
      }
    }

  get name() {
    return this.quoteForm.get('name');
  }
  
  get email() {
    return this.quoteForm.get('email');
  }

  get address() {
    return this.quoteForm.get('address');
  }

  get eventDate() {
    return this.quoteForm.get('eventDate');
  }

  get items() {
    return this.quoteForm.get('items');
  }

  get times() {
    return this.quoteForm.get('times');
  }

  get recaptchaToken() {
    return this.quoteForm.get('recaptchaToken');
  }

}
