import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggingService } from 'src/app/services/logging.service';
import { mapTo, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';



interface LoginResponse {
  token: string;
  status: number;
}
interface CsrfResponse {
  csrf_token: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storeToken = false; 

  private baseUrl = 'http://127.0.0.1:8000/';
  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    private cookieService: CookieService
  ) { 
  }

  private getCsrfToken(): Observable<string> {
    return this.http.get<CsrfResponse>(this.baseUrl + 'csrf-token/', {
      withCredentials: true
  }).pipe(
    tap(response => {
      this.loggingService.log('CSRF response: ' + JSON.stringify(response));
    }),
      
      switchMap((response) => {

        console.log('res ------------>',response);

          const csrfToken = response.csrf_token;

          console.log('crsf ----->',csrfToken);

          if (!csrfToken) {
              return throwError('CSRF token not found in the response');
          }
          this.loggingService.log(`Obtained CSRF token: ${csrfToken}`);
          return of(csrfToken); // Usamos 'of' para convertir el valor en un Observable
      }),
        catchError(error => {
            this.loggingService.error('Error obtaining CSRF token: ' + JSON.stringify(error));
            return throwError(error);
        })
    );
  } 


login(userData: { username?: string; password?: string; }): Observable<LoginResponse> {
  if (!this.storeToken) {
    localStorage.removeItem('auth_token');
  }
  if (!userData.username || !userData.password) {
    this.loggingService.error("Username or password missing");
    return throwError("Username or password missing");
  }
  this.loggingService.log('Logging in with user data: ' + JSON.stringify(userData));
  // Check if the CSRF token cookie exists.
  const csrfToken = this.getCookie('csrftoken');
  this.loggingService.log('CSRF token from cookie: ' + csrfToken);

  if (!csrfToken) {
    // If the CSRF token cookie does not exist, get a new one.
    return this.getCsrfToken().pipe(
      switchMap((csrfToken) => {
        // Set the CSRF token cookie.
        document.cookie = `csrftoken=${csrfToken}; path=/`;
        console.log('csrfToken 1', csrfToken); 
        // Make the login request with the CSRF token cookie.
        return this.makeLoginRequest(userData, csrfToken);
      })
    );
  } else {
    // Make the login request with the CSRF token cookie.
    return this.makeLoginRequest(userData, csrfToken);
  }
}

  private makeLoginRequest(userData: { username?: string; password?: string; }, csrfToken: string): Observable<LoginResponse> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    }),
    withCredentials: true
  };
  this.loggingService.log('Making login request with headers: ' + JSON.stringify(httpOptions.headers));

  // Log the CSRF token cookie.
  this.loggingService.log(`CSRF token cookie: ${csrfToken}`);

  return this.http.post<LoginResponse>(this.baseUrl + 'login/', userData, httpOptions).pipe(
    tap(response => {
      if (response && response.token && this.storeToken) {
        localStorage.setItem('auth_token', response.token);
      }
      this.loggingService.log(`Response status code: ${response.status}`);
      this.loggingService.log(`Response body: ${JSON.stringify(response)}`);
    }),
    catchError(error => {
      this.loggingService.error('Error during login: ' + JSON.stringify(error));
      return throwError(error);
    })
  );
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

