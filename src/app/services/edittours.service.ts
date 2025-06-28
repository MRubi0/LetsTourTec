import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class EdittoursService {

  constructor(private http: HttpClient) { }

  editTour(id: string, body: any, size: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}edit_tour/${id}/${size}/`, body, {
      headers: {
        'Accept': 'application/json',
      }
    });
  }
}