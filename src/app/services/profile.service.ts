import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getProfile(email: string) {
    return this.http.get(`${environment.apiUrl}profile/get?id=${email}`)
      .pipe(map((data: any) => {
        return data;
      }));
  }
  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('avatar', file, file.name);
    
    this.http.post(`${environment.apiUrl}ruta-para-actualizar-imagen`, formData).subscribe({
      next: (response: any) => { // Asume que la respuesta es de tipo any
        console.log('Imagen cargada con éxito', response);
        // Actualizar la vista de perfil según sea necesario
      },
      error: (error: any) => {
        console.error('Error al cargar la imagen', error);
      }
    });
  }
}