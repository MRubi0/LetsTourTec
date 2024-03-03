import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/enviroment/enviroment';
import { AuthService } from 'src/app/services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class UploadTourService {
  private uploadUrl = environment.apiUrl; // Make sure you have the apiUrl defined in the environment

  constructor(private http: HttpClient) {}

  uploadTour(formData: any): Observable<any> {
    return this.http.post(`${this.uploadUrl}profile/upload_tour/`, formData, {
      responseType: 'json', // Expecting a JSON response
      withCredentials: true // This is important for session-based authentication
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error occurred:', error);
        return throwError(() => new Error('An error occurred while uploading the tour.'));
      })
    );
  }

  // Other service methods...

  
  
  

  
 /* getLastestTours() {    
    return this.http.post(`${environment.apiUrl}get_latest_tours/`,formData )
      .pipe(map((data: any) => {        
        return data;
      }));
  }*/
}
