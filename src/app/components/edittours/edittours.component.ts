import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edittours',
  templateUrl: './edittours.component.html',
  styleUrls: ['./edittours.component.scss']
})
export class EdittoursComponent {
  tourForm: FormGroup; 

  constructor(private fb: FormBuilder) { 
    this.tourForm = this.fb.group({
      titulo: [''],
      descripcion: [''],
      latitude: [''],
      longitude: [''],
      duracion: [''],
      recorrido: [''],
      idioma: [''],
      tipo_de_tour: [''],
    });    
  }

}
