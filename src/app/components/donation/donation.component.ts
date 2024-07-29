import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit {
  stripePromise = loadStripe('pk_live_51PbuRQHruQ7absctI9yFcPLBHfXE52gBuzHYtU5IP6A6aDJ7wdksaIJ08lfi0qPl7onM6KhHRMoToIS7c1Ymw6gy00BeAWaMyq');
  donationAmount: number = 3; // Valor por defecto para la donación

  constructor(private http: HttpClient) { }

  ngOnInit(): void {}

  async donate() {
    const stripe = await this.stripePromise;
    const amountInCents = this.donationAmount * 100; // Convertir a centavos
  
    try {
      const session = await this.http.post<{ id: string }>(
        'http://localhost:8000/create-checkout-session/',
        { amount: amountInCents }
      ).toPromise();
  
      if (session && session.id) {
        const { error } = await stripe!.redirectToCheckout({
          sessionId: session.id,
        });
  
        if (error) {
          console.error(error);
        }
      } else {
        console.error('Session not created or session id not available.');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }}
