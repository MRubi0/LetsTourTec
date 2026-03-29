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
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_latest_tours/?language=${lang}`)
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

  getClosestToursByType(lat: string, long: string, tipo: string) {
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_nearest_tours/?latitude=${lat}&longitude=${long}&language=${lang}&tipo=${tipo}`)
      .pipe(map((data: any) => data));
  }
  getRadomTours() {
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_random_tours/?language=${lang}`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
  getAllTours(lat:string, long:string) {    
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_nearest_tours_all/?page=1&latitude=${lat}&longitude=${long}&language=${lang}`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }

  getAllToursValidation() {
    const lang = localStorage.getItem('language') ?? 'es';
    return this.http.get(`${environment.apiUrl}admin/pending_tours/?language=${lang}`)
      .pipe(map((data: any) => data));
  }

  
  getToursByType(tipo: string) {
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_latest_tours/?language=${lang}&tipo=${tipo}`)
      .pipe(map((data: any) => data));
  }

  getAllToursValidated(lat:string, long:string) {    
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_nearest_validated_tours/?page=1&latitude=${lat}&longitude=${long}&language=${lang}`)
      .pipe(map((data: any) => {        
        return data;
      }));
  }
}

