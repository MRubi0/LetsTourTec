import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsrfService } from '../services/csrf.service';



@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(private csrfService: CsrfService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = this.csrfService.getCsrfToken();

    if (csrfToken) {
      req = req.clone({
        setHeaders: {
          'X-CSRFToken': csrfToken
        }
      });
    }

    return next.handle(req);
  }
}
