import { Component, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { CartService, CartItem } from '../../services/cart-service.service';
import { Reservation, ReservedItem } from '../../models/reservation.model';
import { ProductService } from '../../services/product.service';
import { ReservedDatesService } from '../../services/reserved-dates.service';
import { BUFFER_DAYS, EMAIL, MINIMUM_ORDER, DAILY_LATE_FEE, TAX_PERCENTAGE } from '../../shared/constants';
import { EventEmitter } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

declare var grecaptcha: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  partialSuccessMessage = '';

  // Email verification state
  emailVerificationStep = false;
  verificationCodeSent = false;
  emailVerified = false;
  resendCooldown = 0;


  @Output("updateCart") updateCart: EventEmitter<any> = new EventEmitter(); // EventEmitter to notify CartComponent
  
  terms = [
    {
      question: 'Rental amount is due 30 days before event date',
      answer: 'You will receive an invoice by email, and payment must be completed no later than 30 days prior to your event. If your reservation is made less than 30 days in advance, full payment is due within 3 days of confirmation.',
      open: false
    },
    {
      question: 'Cancellations & Refunds accepted 30 days before event',
      answer: 'You may cancel for a full refund up to 30 days before your event.<br>Cancellations made within 30 days of the event may not be eligible for a full refund, depending on the timing and whether items have already been prepared or reserved.',
      open: false
    },
    {
      question: `Late returns will incur a fee of $${DAILY_LATE_FEE} per day`,
      answer: `If items are not returned by the agreed return date, a $${DAILY_LATE_FEE} fee will be charged for each late day unless alternate arrangements have been approved by Final Touch Co. in advance.`,
      open: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private reservationService: ReservationService,
    private cartService: CartService,
    private productService: ProductService,
    private reservedDatesService: ReservedDatesService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z\s]+$/),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
      ]],
      notes: [''], // Optional field
      verificationCode: [''], // For email verification
      agreedToTerms: [false, Validators.requiredTrue], // Must be checked
      recaptchaToken: [''] // For bot prevention
    });
  }

  async ngOnInit() {

    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js?render=6LcDEVsrAAAAAFl4PlRK9kPGNE7941aURycc1U95';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Check if the cart is empty
    const cartItems = this.cartService.getItems();      
  }

  // Getter methods for form validation
  get name() {
    return this.checkoutForm.get('name');
  }

  get email() {
    return this.checkoutForm.get('email');
  }

  get phone() {
    return this.checkoutForm.get('phone');
  }

  get notes() {
    return this.checkoutForm.get('notes');
  }

  get agreedToTerms() {
    return this.checkoutForm.get('agreedToTerms');
  }

  get recaptchaToken() {
    return this.checkoutForm.get('recaptchaToken');
  }

  get verificationCode() {
    return this.checkoutForm.get('verificationCode');
  }
  
  // send the verification code through google api to verify email
  async sendVerificationCode() {
    if (!this.email?.valid) {
      this.errorMessage = 'Please enter a valid email address first.';
      return;
    }

    this.loading = true;
    try {
      // Call your backend API to send verification code
      await lastValueFrom(this.reservationService.sendVerificationCode(this.email.value));
      this.verificationCodeSent = true;
      this.emailVerificationStep = true;
      this.startResendCooldown();
      this.errorMessage = '';
      this.successMessage = 'Verification code sent! Please check your email.';
    } catch (error) {
      console.error('Error sending verification code:', error);
      this.errorMessage = 'Failed to send verification code. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async verifyEmailCode() {
    if (!this.verificationCode?.valid || !this.verificationCode.value) {
      this.errorMessage = 'Please enter the verification code.';
      return;
    }

    this.loading = true;
    try {
      // Call your backend API to verify the code
      const isValid = await lastValueFrom(this.reservationService.verifyEmailCode(
        this.email?.value, 
        this.verificationCode.value
      ));
      
      if (isValid) {
        this.emailVerified = true;
        this.emailVerificationStep = false;
        this.successMessage = 'Email verified! Processing your reservation...';
        this.errorMessage = '';
        
        // Automatically proceed with reservation submission
        await this.submitReservations(this.createReservations());
      } else {
        this.errorMessage = 'Invalid verification code. Please try again.';
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      this.errorMessage = 'Failed to verify code. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  startResendCooldown() {
    this.resendCooldown = 60; // 60 seconds cooldown
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }


  async submitForm() {
    if (this.checkoutForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.partialSuccessMessage = '';

    // Check reservation count does not exceed 2
    if (this.cartService.getReservationCount() > 2) {
      this.loading = false;
      console.error(`You can only submit up to 2 reservations at a time.`);
      this.errorMessage = `You can only submit up to 2 reservations at a time. Sorry for the inconvenience. <br>If you need to submit more, please checkout with the first two, and then start a new reservation for the rest.`;
      return;
    }

    // Check if all items are available
    const unavaliableItems = await this.checkCartAvalibility();
    if (unavaliableItems.size > 0) {
      this.removeUnavaliableItems(unavaliableItems);
      this.loading = false;
      // Do NOT submit any reservations if any item is unavailable
      return;
    }

    // Only submit if all items are available
    const reservations = this.createReservations();

    // check that all reservations hit the minimum order
    for (const reservation of reservations) {
      const groupPrice = reservation.items.reduce((sum, item) => sum + item.price, 0);
      if (groupPrice < MINIMUM_ORDER) {
        this.loading = false;
        console.error(`Reservation for ${reservation.name} is below the minimum order of $${groupPrice}.`);
        this.errorMessage = `Your reservation total is below the minimum order of $${MINIMUM_ORDER}.<br>Please add more items to your cart or increase the quantity of existing items.`;
        return;
      }
    }

    // check email verification
    if (!this.emailVerified) {
      await this.sendVerificationCode();
      return;
    }
    // If email is verified, proceed with reservation submission
    await this.submitReservations(reservations);
  }

  async submitReservations(reservations: Reservation[]) {
    
    let successfulSubmissions = 0;
    let failedSubmissions = 0;

    for (const single_reservation of reservations) {
      // Generate a fresh token for each reservation
      await new Promise<void>((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha.execute('6LcDEVsrAAAAAFl4PlRK9kPGNE7941aURycc1U95', {action: 'submit'}).then((token: string) => {
            this.checkoutForm.patchValue({ recaptchaToken: token });
            this.reservationService.addReservation(single_reservation, token).subscribe(
              (response: Reservation) => {
                successfulSubmissions++;
                if (successfulSubmissions + failedSubmissions === reservations.length) {
                  this.loading = false;
                  if (successfulSubmissions === reservations.length) {
                    this.cartService.clearCart();
                    this.successMessage = 'Your reservation has been successfully submitted! You will receive a confirmation email within 3-5 business days. Please check your spam folder if you do not see it in your inbox.\nThank you for choosing Final Touch !';
                    sessionStorage.setItem('reservationSuccess', 'true');
                    this.routeToSuccessPage();
                    // this.router.navigate(['/reservation-success']);
                  } else if (successfulSubmissions > 0) {
                    this.partialSuccessMessage = `${successfulSubmissions} out of ${reservations.length} reservations were successfully submitted, but some failed.`;
                    this.updateCart.emit('something');
                  }
                }
                resolve();
              },
              (error: any) => {
                failedSubmissions++;
                console.error('Error adding reservation:', error);
                if (successfulSubmissions + failedSubmissions === reservations.length) {
                  this.loading = false;
                  if (successfulSubmissions === 0) {
                    this.errorMessage = `There was an error processing your reservation.<br>Try again, if it still fails, please email your reservation details to ${EMAIL}. Sorry for the inconvenience.`;
                  } else {
                    this.partialSuccessMessage = `${successfulSubmissions} out of ${reservations.length} reservations were successfully submitted, but some failed. Please try again, and if it still fails, please email your reservation details to ${EMAIL}.`;
                    this.updateCart.emit('something');
                  }
                }
                resolve();
              }
            );
          });
        });
      });
    }
  }

  routeToSuccessPage() {
    this.router.navigate(['/reservation-success']).then(() => {
        // Scroll to .app-container
        setTimeout(() => {
          const appContainer = document.querySelector('.app-container');
          if (appContainer) {
            appContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo(0, 0);
          }
        }, 100);
      });
  }


    /**
     * Create reservations based on cart items grouped by `datesReserved`.
     */
    createReservations(): Reservation[] {
      // Group cart items by datesReserved
      const reservations: Reservation[] = [];
      const reservationsMap = this.cartService.getReservationMap();

      // Loop through each group (key = date range, value = CartItem[])
      reservationsMap.forEach((groupedItems, key) => {

        // Calculate totals plus tax 
        const totalPrice = groupedItems.reduce((sum, item) => sum + item.price, 0) + (groupedItems.reduce((sum, item) => sum + item.price, 0) * TAX_PERCENTAGE); // Assuming 6% tax
        const totalDeposit = groupedItems.reduce((sum, item) => sum + item.deposit, 0);

        // Create ReservedItem[] from groupedItems
        const reservedItems: ReservedItem[] = groupedItems.map(item => {
          const product = this.productService.getProductSync(item.productId);
            return {
              productId: item.productId,
              name: product?.name ?? item.name,
              price: product?.price ?? item.price,
              deposit: product?.deposit ?? item.deposit,
              description: product?.description ?? "no description avaliable",
              quantity: item.quantity
            };
        });

        const resName = this.checkoutForm.value.name.replace(/\s+/g, '') + "-" + Math.random().toString(36).substring(2, 10);

        // Build the reservation object
        const reservation: Reservation = {
          status: 'pending',
          reservationId: resName,
          name: this.checkoutForm.value.name,
          dates: groupedItems[0]?.datesReserved ?? [],
          pickupNotes: "",
          items: reservedItems, // or map to ReservedItem[] if needed
          email: this.checkoutForm.value.email,
          phoneNumber: this.checkoutForm.value.phone,
          customerNotes: this.checkoutForm.value.notes || '',
          price: totalPrice,
          deposit: totalDeposit,
          reservedOn: new Date(),
          invoiceStatus: "not sent",
          paymentStatus: "not received",
          depositStatus: "not returned",
          myNotes: ""
        };

        reservations.push(reservation);
      });

      return reservations;
    }


    async checkCartAvalibility(): Promise<Map<string, string>> {
      await this.productService.fetchProducts(); // get the most up to date products
      console.log("Checking cart availability...");

      const unavaliableItems: Map<string, string> = new Map<string, string>();
      const cartItems = this.cartService.getItems();
      await Promise.all(cartItems.map(async (item) => {
        // get product to make sure it is still active
        const product = this.productService.getProductSync(item.productId);
        if (product) {
          // check if dates are still avaliable
          console.log('Checking availability for product:', product.name, 'with dates:', item.datesReserved);
          try {
            const reservedDates = await lastValueFrom(this.reservedDatesService.getReservedDatesByProductId(product.productId));
            console.log('Reserved dates for product:', product.name, 'are:', reservedDates);
            const isAvailable = item.datesReserved.every(date => {
              return !reservedDates.some(reservedDate => {
                const d1 = new Date(reservedDate);
                const d2 = new Date(date);
                const diffDays = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= BUFFER_DAYS;
              });
            });
            if (!isAvailable) { // if any of the dates are unavaliable, then notify that item is unavaliable 
              console.log(`Item ${product.name} is NOT available for the selected dates.`);
              unavaliableItems.set(`${item.productId}`, `${item.name}`);
            } else {
              console.log(`Item ${product.name} is available for the selected dates.`);
            }
          } catch (error) {
            console.error('Error fetching reserved dates:', error);
          }
        } else {
          unavaliableItems.set(`${item.productId}`, `${item.name}`);
        }
      }));
      return unavaliableItems;
    }

    removeUnavaliableItems(unavaliableItems: Map<string, string>): void {
      unavaliableItems.forEach((name, productId) => {
        console.warn(`Item ${name} is no longer available. Removing from cart.`);
        // todo display error message to user
        const links = Array.from(unavaliableItems.entries())
          .map(([productId, name]) => `<a href="/product/${productId}" target="_blank">${name}</a>`)
          .join(', ');
        this.errorMessage = `The following items are no longer available:<br><br>${links}.<br><br>They have been removed from your cart. Please check the product availability and try again.`;
        console.log(this.errorMessage);
        // Remove the item from the cart
        this.cartService.removeFromCart(productId);

        const cartItems = this.cartService.getItems();

        this.updateCart.emit('something');
      });
    }

  toggleAnswer(terms: any[], index: number): void {
    terms.forEach((term, i) => {
      term.open = i === index ? !term.open : false;
    });
  }

  closeErrorPopup() {
    this.errorMessage = '';
  }

  calculateGroupTotal(items: CartItem[]): number {
      return items.reduce((total, item) => total + item.price, 0);
    }
}