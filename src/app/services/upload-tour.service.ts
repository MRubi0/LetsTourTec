import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadTourService {
  private uploadUrl = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) { }

  // Método para subir el tour, formData incluirá los datos del formulario
  uploadTour(formData: FormData): Observable<any> {
    return this.http.post(this.uploadUrl, formData);
  }
}
