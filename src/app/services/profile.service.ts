import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError  } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient, private authService: AuthService) { } 

  getProfile(email: string) {
    return this.http.get(`${environment.apiUrl}profile/get?id=${email}`)
      .pipe(map((data: any) => {
        return data;
      }));
  }
  updateUserProfile(formData: FormData) {
    const token = this.authService.getToken(); 
    console.log(token)
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post(`${environment.apiUrl}ruta-para-actualizar-perfil`, formData).pipe(
      map(response => {
        // Procesamiento de la respuesta si es necesario
        return response;
      }),
      catchError((error: any) => {
        // Manejo centralizado de errores
        console.error('Ocurrió un error al actualizar el perfil', error);
        return throwError(() => new Error('Error al actualizar el perfil'));
      })
    );
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