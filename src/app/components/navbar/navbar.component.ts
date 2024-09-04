import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar', 
  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.scss'] 
})


export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false; 
  languaje:string='';
  private authSubscription!: Subscription;


  constructor(private authService: AuthService, private translate: TranslateService) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      }
    );
    const lang = localStorage.getItem('language');
    if(!lang){
      localStorage.setItem('language', 'es');
    }
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe(); 
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }


  switch(lang: string) {
    this.translate.use(lang);
    if(lang!=this.languaje){
      this.languaje=lang;
      window.location.reload();
    }
    localStorage.setItem('language', lang);
  }
}
