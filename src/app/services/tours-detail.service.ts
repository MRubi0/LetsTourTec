import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ToursDetailService {

  constructor(private http: HttpClient) { } 

  getTourDetail(id: string) {
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_tour_distance/?tourId=${id}&latitude=4.6408516&longitude=-74.1445487&languaje=${lang}`)
      .pipe(map((data: any) => {
        return data;
      }));
  }

  getAdditionalLocations(tourId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}tour-locations/${tourId}`); 
  }
}