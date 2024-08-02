import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  currentUser!:any;

  ngOnInit(){
    this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.currentUser=isAuthenticated;
        console.log('this.currentUser ', this.currentUser);
      }
    );
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.currentUser && this.currentUser.access) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.currentUser.access}`
        }
      });
    }

    return next.handle(request);
  }
}
