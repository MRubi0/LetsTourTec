import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}admin/stats/`);
  }

  getPendingTours(lang = 'es'): Observable<any> {
    return this.http.get(`${environment.apiUrl}admin/pending_tours/?language=${lang}`);
  }

  getPublishedTours(lang = 'es'): Observable<any> {
    return this.http.get(`${environment.apiUrl}admin/published_tours/?language=${lang}`);
  }

  approveTour(tourId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}tours/${tourId}/validado/`, { validado: true });
  }

  rejectTour(tourId: number, reason?: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}tours/${tourId}/validado/`, { validado: false, motivo: reason || '' });
  }

  deleteTour(tourId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}admin/tours/${tourId}/delete/`);
  }

  unpublishTour(tourId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}tours/${tourId}/validado/`, { validado: false });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}admin/users/`);
  }

  toggleUserActive(userId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}admin/users/${userId}/toggle_active/`, {});
  }
}
