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

  getClosestTours(lat:string, long:string) {  
  const lang = localStorage.getItem('language');
  return this.http.get(`${environment.apiUrl}get_nearest_tours/?latitude=${lat}&longitude=${long}&language=${lang}`)
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
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_nearest_tours_all/?page=1&latitude=None&longitude=None&language=${lang}`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
}
