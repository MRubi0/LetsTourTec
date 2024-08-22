import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { FormGroup, FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';
import { CountdownEComponent } from '../generics/countdown-e/countdown-e.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VotacionModalComponent } from '../votacion-modal/votacion-modal.component';
import { CalificacionService } from 'src/app/services/calificacion-service.service';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent implements AfterViewInit {
  formData: FormData = new FormData();
  edad: number = 0;
  edadInvalida: boolean = false;
  id:string='';
  finishForm!: FormGroup;
  mostrarDonacion: boolean = false;

  constructor(public dialog: MatDialog, private http: HttpClient, public ngbModal: NgbModal, private formBuilder: FormBuilder,private calificacionService: CalificacionService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(){
    //const calificacion = sessionStorage.getItem('tourCalificacion');
    this.calificacionService.calificacion$.subscribe(calificacion => {
    if (calificacion === null || calificacion === 4 || calificacion === 5) {
      this.mostrarDonacion = true;
    } else {
      this.mostrarDonacion = false;
    }
  });
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
      this.finishForm.get('id')?.setValue(this.id);
    });   
    this.finishForm.get('subpregunta3_1')?.disable();
    this.finishForm.get('subpregunta19_1')?.disable();
  }
  ngAfterViewInit() {
    console.log("ngAfterViewInit ejecutado");
    setTimeout(() => {
      this.dialog.open(VotacionModalComponent, {
        width: '90%',
        height:'400px',
        data: { tourId: this.id }
      }).afterClosed().subscribe(result => {
        console.log('El modal de votación fue cerrado', result);
      });
    }, 500);
  }
  submitSurvey() {
    if (this.finishForm.valid) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.finishForm.get('id')?.setValue(this.id);
      console.log('el id del tour es el siguiente:', this.id)
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
  change(question:number){
    const data = this.finishForm.value;
    if(question==3){
      if(data.pregunta3=='Otra'){
        this.finishForm.get('subpregunta3_1')?.enable();
      }else{
        this.finishForm.get('subpregunta3_1')?.disable();
      } 
    }else{
      if(data.pregunta19=='Otro'){
        this.finishForm.get('subpregunta19_1')?.enable();
      }else{
        this.finishForm.get('subpregunta19_1')?.disable();
      } 
    }    
  }
  onSubmit() { 
    console.log("Intentando enviar datos...");
    this.submitSurvey();
    this.ngbModal.open(CountdownEComponent,{ size: 'sm'});
  }  
}