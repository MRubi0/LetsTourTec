import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent {
  formData: FormData = new FormData();
  edad: number = 0;
  edadInvalida: boolean = false;
  constructor(private http: HttpClient) {}

  submitSurvey(form: NgForm) {
    if (form.valid && this.edad !== 0) {
      // El formulario es válido y la edad no es 0, procede con el envío de los datos
      const formData: any = new FormData();
      Object.keys(form.value).forEach(key => {
        // Aquí puedes decidir cómo manejar el valor de edad si es 0
        formData.append(key, form.value[key]);
      });
  
      this.http.post<any>(`${environment.apiUrl}encuesta/`, formData)
        .subscribe(
          data => {
            console.log('Datos enviados con éxito:', data);
          },
          error => {
            console.error('Error al enviar los datos:', error);
          }
        );
    } else {
      if (this.edad <= 0) {
        this.edadInvalida = true;
        console.error('La edad proporcionada no es válida');
        // Aquí puedes mostrar un mensaje de error en la UI
      }alert('Por favor, completa todos los campos obligatorios.');
    }
  }
}