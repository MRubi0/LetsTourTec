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
    const lang = localStorage.getItem('language');
    return this.http.get(`${environment.apiUrl}get_tour_with_steps/${id}/${lang}`)
      .pipe(map((data: any) => {
        if (data && data.steps && Array.isArray(data.steps)) {
          const adjustedSteps = data.steps.map((step: any, index: number) => {
            return { ...step, stepNumber: index + 1 };
      });
      data.steps = adjustedSteps;
  }
  return data;
      }));
    }


  createTourRecord(tourId: string) {
    const url = `${environment.apiUrl}/create-tour-record/`;
    return this.http.post(url, { tour_id: tourId });
  }
  
  enviarValoracion(tourId: string, calificacion: number, comentario: string) {   
    const url = `${environment.apiUrl}crear_valoracion`;
    return this.http.post(url, { tour_id: tourId, puntuacion: calificacion, comentario: comentario });
  }

}
