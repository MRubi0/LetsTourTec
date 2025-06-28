import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor(private http: HttpClient) { }

  validateTour(data:any): Observable<any> {
    return this.http.put(`${environment.apiUrl}tours/${data.tour_id}/validado/`, {"validado":data.validate}, {
      headers: {
        'Accept': 'application/json',
      }
    });
  }
}
