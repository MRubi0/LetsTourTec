import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar', 
  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.scss'] 
})


export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false; 
  private authSubscription!: Subscription;


  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      }
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe(); 
  }

  logout() {
    this.authService.logout();
  }
}
