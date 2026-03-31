import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-navbar', 
  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.scss'] 
})


export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  menuOpen: boolean = false;
  languaje:string='';
  private authSubscription!: Subscription;


  constructor(private authService: AuthService, private translate: TranslateService, private router: Router) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        this.isAdmin = false;
        if (isAuthenticated) {
          const token = this.authService.getToken();
          if (token) {
            const decoded: any = jwtDecode(token);
            this.isAdmin = !!decoded.is_staff;
          }
        }
      }
    );
    const lang = localStorage.getItem('language') || 'es';
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'es');
    }
    this.languaje = lang;
    this.translate.use(lang);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe(); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  switch(lang: string) {
    if (lang !== this.languaje) {
      this.languaje = lang;
      this.translate.use(lang);
      localStorage.setItem('language', lang);
    }
  }
}
