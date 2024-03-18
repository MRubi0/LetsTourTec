import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { FormGroup, FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';
import { CountdownEComponent } from '../generics/countdown-e/countdown-e.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent {
  formData: FormData = new FormData();
  edad: number = 0;
  edadInvalida: boolean = false;

  finishForm!: FormGroup;

  constructor(private http: HttpClient, public ngbModal: NgbModal, private formBuilder: FormBuilder) {}

  ngOnInit(){
    this.finishForm = this.formBuilder.group({
      age: ['', [Validators.required, Validators.min(0)]],
      gender: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      travels:['', [Validators.required]],
      toursForYear:['', [Validators.required]],
      format:['', [Validators.required]],
      duration:['', [Validators.required]],
      objectives:['', [Validators.required]],
      next_vacations:['', [Validators.required]],
      recomendation:['', [Validators.required]],
      flexibility:['', [Validators.required]],
      acces:['', [Validators.required]],
      socialmedia:['', [Validators.required]],
      
      value:[''],   
      content:[''],
      correct_duration:[''],      
      most_value:[''],
      less_value:[''],      
      problems:[''],      
      probability:[''],      
      payfor:[''],      
      actualizations:['']      
    });
    this.finishForm.valueChanges.subscribe(data=>{
      console.log('data ', data);
    });
  }
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
  onSubmit() { 
    this.ngbModal.open(CountdownEComponent,{ size: 'sm'});
  }
  
}