import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from 'src/app/services/logging.service';
import { environment } from 'src/enviroment/enviroment';



export interface AuthTokens {
    access: string;
    refresh: string;
  }
@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public current = new BehaviorSubject<string | null>(this.getToken());

  private refresh_token='';

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private loggingService: LoggingService) {
    this.startTokenRefresh();
  }

  login(email: string, password: string): Observable<AuthTokens> {
      return this.http.post<AuthTokens>( environment.apiUrl + 'login/', { email, password }).pipe(
      tap((tokens: AuthTokens) => this.saveTokens(tokens)),
      catchError(error => {
        this.loggingService.error('Error during login: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  public saveTokens(tokens: AuthTokens): void {
    this.refresh_token=tokens.refresh;
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

  startTokenRefresh(): void {
    setInterval(() => {
      const token = localStorage.getItem('refresh_token');
      if(token){
        this.refreshToken().subscribe({
          next: (tokens: AuthTokens) => {
            this.saveTokens(tokens);
          },
          error: (error) => {
            console.error('Error during token refresh', error);
            this.logout();
          }
        });
      }      
    }, 2 * 60 * 59 * 1000);
  }
  

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
  refreshToken() {
    const token = localStorage.getItem('refresh_token');
    return this.http.post<any>(`${environment.apiUrl}api/token/refresh/`, { refresh: token })
      .pipe(map((user:any) => {
        this.setToken(user.access, user.refresh);
        this.isAuthenticatedSubject.next(true);
        this.current.next(user);
        return user;
      }));
  }

  logout() {
    this.removeTokens();
    localStorage.removeItem('currentUser');
  }
  setToken(access: string, refresh:string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh );
   }

   clearToken(): void {
    localStorage.removeItem('access_token');
   }
   isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
   }      
}

