import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class EdittoursService {

  constructor(private http: HttpClient) { }

  editTour(id: string, body: any): Observable<any> {
    const lang = localStorage.getItem('language');
    console.log('body --> ', body, id);
    return this.http.put(`${environment.apiUrl}api/edit_tour/${id}/`, body, {
      headers: {
        'Accept': 'application/json',
      }
    });
  }
}