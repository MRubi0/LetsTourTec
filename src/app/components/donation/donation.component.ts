import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit {
  stripePromise = loadStripe('pk_live_51PbuRQHruQ7absctI9yFcPLBHfXE52gBuzHYtU5IP6A6aDJ7wdksaIJ08lfi0qPl7onM6KhHRMoToIS7c1Ymw6gy00BeAWaMyq');
  donationAmount: number = 3; // Valor por defecto para la donación
  isProcessing: boolean = false;
  finishForm!: FormGroup;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.finishForm = this.formBuilder.group({
      donationAmount: [this.donationAmount, [Validators.required, Validators.min(1.00)]]
    });
  }

  increaseAmount() {
    const currentValue = this.finishForm.get('donationAmount')?.value || this.donationAmount;
    this.finishForm.patchValue({ donationAmount: currentValue + 1 });
  }

  decreaseAmount() {
    const currentValue = this.finishForm.get('donationAmount')?.value || this.donationAmount;
    if (currentValue > 1) {
      this.finishForm.patchValue({ donationAmount: currentValue - 1 });
    }
  }

  async donate() {
    if (this.isProcessing) return; // Prevent multiple clicks
    this.isProcessing = true;
    const stripe = await this.stripePromise;
    const amountInCents = this.finishForm.get('donationAmount')?.value * 100;
    try {
      const session = await this.http.post<{ id: string }>(
        'https://letstourtec-c393a22f9c2b.herokuapp.com/create-checkout-session/', // This URL will be updated in a later step by the user/other Jules
        { amount: amountInCents }
      ).toPromise();

      if (session && session.id) {
        const { error } = await stripe!.redirectToCheckout({
          sessionId: session.id,
        });

        if (error) {
          console.error('Stripe checkout error:', error);
          // Consider user-facing error message here via a snackbar/alert
        }
      } else {
        console.error('Session not created or session id not available.');
        // Consider user-facing error message here
      }
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      // Consider user-facing error message here
    } finally {
      this.isProcessing = false;
    }
  }
}

