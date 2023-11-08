import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UploadTourService {
  private uploadUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  uploadTour(formData: FormData): Observable<any> {

    return this.http.post(`${this.uploadUrl}profile/upload_tour/`, {
      user:7,
      titulo:'titulo',
      imagen:'img',
      descripcion:'desc',
      audio:'',
      latitude:1.2,
      longitude:1,
      duracion:1,
      recorrido:1,
      created_at: '2023-07-01 05:02:09 +0000',
      updated_at: '2023-07-01 05:02:09 +0000'
    });
  }

  
 /* getLastestTours() {    
    return this.http.post(`${environment.apiUrl}get_latest_tours/`,formData )
      .pipe(map((data: any) => {        
        return data;
      }));
  }*/
}
