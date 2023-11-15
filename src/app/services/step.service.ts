import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class StepService {

  constructor(private http: HttpClient) { 
    
  }
  getTourDetail(id: string) {
    return this.http.get(`${environment.apiUrl}/api/get_tour_with_steps/${id}`)
      .pipe(map((data: any) => {
        return data;
      }));
  }
}
