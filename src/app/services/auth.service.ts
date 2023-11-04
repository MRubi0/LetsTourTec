import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggingService } from 'src/app/services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storeToken = false; 
  private baseUrl = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient, private loggingService: LoggingService) {}

  login(email: string, password: string): Observable<any> {
    const csrfToken = this.getCsrfTokenFromCookie();
    if (!csrfToken) {
      this.loggingService.error("CSRF token is missing");
      return throwError(() => new Error("CSRF token is missing"));
    }
    this.loggingService.log('Logging in with user data: ' + JSON.stringify({ email, password }));
  
    return this.makeLoginRequest({ email, password }, csrfToken).pipe(
      tap(tokens => {
        // Check if the backend response has the properties access and refresh
        if (tokens.access && tokens.refresh) {
          // Store both access and refresh tokens in local storage
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
        } else {
          throw new Error('Invalid token response');
        }
      }),
      catchError(error => {
        this.loggingService.error('Error during login: ' + JSON.stringify(error));
        return throwError(() => error);
      })
    );
  }
  



  getCsrfTokenFromCookie(): string | null {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || null; // Asegúrate de devolver null si no se encuentra la cookie

    return csrfToken;
  }
  private makeLoginRequest(credentials: { email: string; password: string }, csrfToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    });
  
    return this.http.post(this.baseUrl + 'api/token/', credentials, { headers });
  }
  makePostRequestWithCsrf(url: string, body: any): Observable<any> {
    const csrfToken = this.getCsrfTokenFromCookie(); // Obtener el token CSRF de la cookie
    if (!csrfToken) {
      // Handle the missing CSRF token case
      this.loggingService.error('CSRF token is missing');
      return throwError(() => new Error('CSRF token is missing'));
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken // Usar el token obtenido
    });

    // Haz la petición POST con las cabeceras adecuadas
    return this.http.post(url, body, { headers: headers, withCredentials: true });
  }
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
   }
   getToken(): string | null {
    return localStorage.getItem('access_token');
   }
   clearToken(): void {
    localStorage.removeItem('access_token');
   }
   isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
   }
      
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    this.loggingService.log('All cookies: ' + value);
    this.loggingService.log(`Parts after splitting with ${name}=: ${parts.length} - ${JSON.stringify(parts)}`);

    if (parts.length === 2) {
      //return parts[1].split(`; ${name}=`)[1].split(';')[0];
      const poppedValue = parts.pop();
      const result = poppedValue ? poppedValue.split(';').shift() : null;
      this.loggingService.log(`Value after splitting for ${name}: ${result}`);
      return result !== undefined ? result : null;


    } else {
      return null;
    }
  }
}

