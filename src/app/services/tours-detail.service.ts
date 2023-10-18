import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ToursDetailService {

  constructor(private http:HttpClient) { }

  getTourDetail(id:string) {    
    return this.http.get(`${environment.apiUrl}get_tour_distance/?tourId=${id}
    &latitude=4.6408516&longitude=-74.1445487`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
}
