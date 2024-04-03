import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { FormGroup, FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';
import { CountdownEComponent } from '../generics/countdown-e/countdown-e.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent {
  formData: FormData = new FormData();
  edad: number = 0;
  edadInvalida: boolean = false;
  id:string='';
  finishForm!: FormGroup;

  constructor(private http: HttpClient, public ngbModal: NgbModal, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) {}

  ngOnInit(){
    this.finishForm = this.formBuilder.group({
      pregunta1: ['', [Validators.required, Validators.min(1)]],
      pregunta2: ['', [Validators.required]],
      pregunta3: ['', [Validators.required]],
      subpregunta3_1:[''],  
      pregunta4:['', [Validators.required]],
      pregunta5:['', [Validators.required]],
      pregunta6:['', [Validators.required]],
      pregunta7:['', [Validators.required]],
      subpregunta7_1:[''],  
      pregunta8:['', [Validators.required]],
      subpregunta8_1:[''],  
      subpregunta8_2:[''],  
      pregunta9:['', [Validators.required]],
      pregunta10:[''],
      pregunta11:['', [Validators.required]],
      pregunta12:[''],   
      pregunta13:[''],
      pregunta14:[''],
      pregunta15:['', [Validators.required]],
      pregunta16:['', [Validators.required]],
      pregunta17:['', [Validators.required]],
      pregunta18:['', [Validators.required]],
      pregunta19:['', [Validators.required]],
      subpregunta19_1:[''],
      pregunta20:[''],
      pregunta21:['', [Validators.required]],
      pregunta22:[''],
      id:[''],     
    });
    this.activatedRoute.params.subscribe((params:any)=>{
      this.id = params['id'];
      console.log('param ', this.id, params);
      this.finishForm.get('id')?.setValue(this.id);
    });   
  
    this.finishForm.valueChanges.subscribe(data=>{
      console.log('data ', data);
    })
  }
  submitSurvey() {
    if (this.finishForm.valid) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.finishForm.get('id')?.setValue(this.id);
      const formValues = this.finishForm.value;
      this.http.post<any>(`${environment.apiUrl}encuesta/`, JSON.stringify(formValues), { headers: headers })
        .subscribe(
          data => {
            console.log('Datos enviados con éxito:', data);
            console.log(JSON.stringify(formValues))
          },
          error => {
            console.error('Error al enviar los datos:', error);
            // Aquí podrías manejar el error
          }
        );
    } else {
      console.error('El formulario no es válido');
      alert('Por favor, completa todos los campos obligatorios.');
    }
  }
  
  onSubmit() { 
    console.log("Intentando enviar datos...");
    this.submitSurvey();
    this.ngbModal.open(CountdownEComponent,{ size: 'sm'});
  }  
}