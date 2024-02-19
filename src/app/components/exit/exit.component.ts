import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent {
  formData: FormData = new FormData();

  constructor(private http: HttpClient) {}

  submitSurvey() {
    // Obtener el formulario
    const form = document.querySelector('form');

    // Verificar si el formulario existe
    if (form) {
      // Crear FormData solo si se encontró el formulario
      this.formData = new FormData(form);

      // Enviar los datos del formulario utilizando HttpClient
      this.http.post<any>(`${environment.apiUrl}encuesta/`, this.formData)
        .subscribe(
          data => {
            console.log('Datos enviados con éxito:', data);
            // Aquí puedes manejar la respuesta si es necesario
          },
          error => {
            console.error('Error al enviar los datos:', error);
          }
        );
    } else {
      console.error('No se encontró ningún formulario en la página');
    }
  }
}
