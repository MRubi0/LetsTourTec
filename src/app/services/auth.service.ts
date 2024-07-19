import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from 'src/app/services/logging.service';

export interface AuthTokens {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://letstourtec-c393a22f9c2b.herokuapp.com/';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private loggingService: LoggingService) {}

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(this.baseUrl + 'api/token/', { email, password }).pipe(
      tap((tokens: AuthTokens) => this.saveTokens(tokens)),
      catchError(error => {
        this.loggingService.error('Error during login: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.removeTokens();
    this.isAuthenticatedSubject.next(false);
  }

  public saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.isAuthenticatedSubject.next(true);
  }

  private removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http.post<AuthTokens>(this.baseUrl + 'api/refresh_token/', { 'refresh': refreshToken }).pipe(
      tap((tokens: AuthTokens) => {
        this.saveTokens(tokens);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private getCsrfTokenFromCookie(): string | null {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || null;
  }

  private makeLoginRequest(credentials: { email: string; password: string }, csrfToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    });

    return this.http.post(this.baseUrl + 'api/token/', credentials, { headers });
  }

  makePostRequestWithCsrf(url: string, body: any): Observable<any> {
    const csrfToken = this.getCsrfTokenFromCookie();
    if (!csrfToken) {
      this.loggingService.error('CSRF token is missing');
      return throwError(() => new Error('CSRF token is missing'));
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    });

    return this.http.post(url, body, { headers: headers, withCredentials: true });
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
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
      const poppedValue = parts.pop();
      const result = poppedValue ? poppedValue.split(';').shift() : null;
      this.loggingService.log(`Value after splitting for ${name}: ${result}`);
      return result !== undefined ? result : null;
    } else {
      return null;
    }
  }
}
