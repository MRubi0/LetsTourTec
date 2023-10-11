import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LatestToursService {

  variable:any;

  constructor(private http:HttpClient) { }

  getLastestTours() {    
    return this.http.get(`${environment.apiUrl}get_latest_tours/`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }

  getClosestTours() {    
    return this.http.get(`${environment.apiUrl}get_nearest_tours/?latitude=4.653056&longitude=-74.1310464`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
  getRadomTours() {    
    return this.http.get(`${environment.apiUrl}get_random_tours/`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
  getAllTours() {    
    return this.http.get(`${environment.apiUrl}get_nearest_tours_all/?page=1&latitude=None&longitude=None`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
}
