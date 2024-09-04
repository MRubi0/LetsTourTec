import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  currentUser: any;

  constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this.currentUser = {
            access: this.authService.getToken()
          };
        } else {
          this.currentUser = null;
        }
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
