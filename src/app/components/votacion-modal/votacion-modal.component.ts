import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StepService } from 'src/app/services/step.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';



@Component({
  selector: 'app-votacion-modal',
  templateUrl: './votacion-modal.component.html',
  styleUrls: ['./votacion-modal.component.scss']
})
export class VotacionModalComponent {
  calificacion = 0;
  mensajeHover: string = '';
  comentario: string = '';  // Nueva propiedad para la reseña
  finishForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VotacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private StepService: StepService ,
    private translate: TranslateService 
  ) {}

  ngOnInit(){
     
    this.finishForm = this.formBuilder.group({
      calificacion: [null, [Validators.required]], 
      comentario: ['']
    });
  }

  get calificacion() {
    return this.finishForm.get('calificacion')?.value || 0;
  }


  onRate(calificacion: number,) {
    this.finishForm.get('calificacion')?.setValue(calificacion);
  }

  onHover(calificacion: number) {
    const key = `valoraciones.${calificacion}`;  
    this.translate.get(key).subscribe((translatedText: string) => {
      this.mensajeHover = translatedText;  
    });
  }
  

  

  enviarVotacion() {
    if (this.finishForm.valid) {
      const { calificacion, comentario } = this.finishForm.value;
      console.log(this.data.tourId, this.calificacion, this.comentario);
      this.StepService.enviarValoracion(this.data.tourId, this.calificacion, this.comentario).subscribe(
        response => {
          console.log(response);
          this.dialogRef.close();
        },
        error => {
          console.error(error);
        }
      );
    } else {
      console.error("Formulario inválido");
    }
  }
}
