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
    return this.http.get(`${environment.apiUrl}api/get_tour_with_steps/${id}`)
      .pipe(map((data: any) => {
        //console.log(data)
        if (data && data.steps && Array.isArray(data.steps)) {
          const adjustedSteps = data.steps.map((step: any, index: number) => {
            return { ...step, stepNumber: index + 1 };
      });
      data.steps = adjustedSteps;
  }
  console.log(data);
  return data;
      }));
    }


  createTourRecord(tourId: string) {
    const url = `${environment.apiUrl}api/create-tour-record/`;
    return this.http.post(url, { tour_id: tourId });
  }
  
  

}
