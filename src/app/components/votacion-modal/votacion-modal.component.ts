import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StepService } from 'src/app/services/step.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-votacion-modal',
  templateUrl: './votacion-modal.component.html',
  styleUrls: ['./votacion-modal.component.scss']
})
export class VotacionModalComponent {
  calificacion = 0;
  mensajeHover: string = '';

  constructor(
    public dialogRef: MatDialogRef<VotacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private StepService: StepService ,
    private translate: TranslateService 
  ) {}

  onRate(calificacion: number) {
    this.calificacion = calificacion;
  }
  

  enviarVotacion() {
    console.log(this.data.tourId, this.calificacion);
    this.StepService.enviarValoracion(this.data.tourId, this.calificacion).subscribe(
      response => {
        console.log(response);
        this.dialogRef.close();
      },
      error => {
        console.error(error);
      }
    );
  }
  onHover(calificacion: number) {
    const key = `valoraciones.${calificacion}`;  
    this.translate.get(key).subscribe((translatedText: string) => {
      this.mensajeHover = translatedText;  
    });
  }
  
}
