import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  csrfToken: string='';

  constructor(private http: HttpClient) {}

  loadCsrfToken(): Observable<any> {
    return this.http.get('get-csrf-token/', { withCredentials: true });
  }

  setCsrfToken(token: string) {
    this.csrfToken = token;
  }

  getCsrfToken() {
    return this.csrfToken;
  }
}
