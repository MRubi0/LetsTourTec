import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackService } from 'src/app/services/snack.service';
import { UploadTourService } from 'src/app/services/upload-tour.service'


@Component({
  selector: 'app-upload-tour',
  templateUrl: './upload-tour.component.html',
  styleUrls: ['./upload-tour.component.scss']
})
export class UploadTourComponent implements OnInit{
  tourForm: FormGroup;
  loading=false;
  MAX_EXTRA_STEPS = 100;
  @ViewChild('imagenInput') imagenInputElement!: ElementRef;
  @ViewChild('audioInput') audioInputElement!: ElementRef;

  opciones = [
    { value: 'cultural', viewValue: 'Cultural Tour' },
    { value: 'leisure', viewValue: 'Leisure Tour' },
    { value: 'nature', viewValue: 'Nature Tour' },
  ];

  opciones_idioma = [
    { value: 'es', viewValue: 'Español' },
    { value: 'en', viewValue: 'Inglés' },
  ];

  constructor(private fb: FormBuilder, private uploadTourService: UploadTourService, 
    private snackbarService:SnackService, private router: Router) {
    this.tourForm = this.fb.group({
      tipo_de_tour: '',
      titulo: '',
      descripcion: '',
      imagen: '',
      audio: '',
      latitude: '',
      longitude: '',
      duracion: '',
      recorrido: '',     
      extraSteps: this.fb.array([])
    });
  }
  ngOnInit(): void {
    this.tourForm.valueChanges.subscribe(data=>{
      console.log(' tour ', data);
    });
  }
  get extraSteps() {
    return this.tourForm.get('extraSteps') as FormArray;
  }

  addExtraStep() {
    if (this.extraSteps.length < this.MAX_EXTRA_STEPS) {
      const extraStepGroup = this.fb.group({
        image: '',
        audio: '',
        latitude: '',
        longitude: '',
        description: '',
        tittle: ''
      });
      this.extraSteps.push(extraStepGroup);
    }
  }
  removeExtraStep(index: number): void {
    this.extraSteps.removeAt(index);
  }

    

  submitTour() {
    const formData = this.prepareSave();
    this.loading=true
    this.uploadTourService.uploadTour(formData).subscribe(
      (response: any) => {
        this.snackbarService.openSnackBar(response.message,'OK');  
        this.loading=false; 
        this.router.navigate([ '/home']);
      },
      (error: any) => {
        this.loading=false;
        console.log("Error uploading tour", error);
      }
    );
  }

  private prepareSave(): FormData {
    const formModel = this.tourForm.value;
    const formData = new FormData();

    // Append each form field to the FormData object
    formData.append('tipo_de_tour', formModel.tipo_de_tour);
    formData.append('titulo', formModel.titulo);
    formData.append('descripcion', formModel.descripcion);
    formData.append('imagen', this.tourForm.get('imagen')?.value);
    formData.append('audio', this.tourForm.get('audio')?.value);
    formData.append('latitude', formModel.latitude);
    formData.append('longitude', formModel.longitude);
    formData.append('duracion', formModel.duracion);
    formData.append('recorrido', formModel.recorrido);

    formModel.extraSteps.forEach((extraStep: any, index: number) => {
      if (extraStep.tittle) {
        formData.append(`tittle_${index}`, extraStep.tittle);
      }
      if (extraStep.image) {
        formData.append(`extra_step_image_${index}`, extraStep.image);
      }
      if (extraStep.audio) {
        formData.append(`extra_step_audio_${index}`, extraStep.audio);
      }
      if (extraStep.description) {
        formData.append(`description_${index}`, extraStep.description);
      }
      if (extraStep.latitude) {
        formData.append(`extra_step_latitude_${index}`, extraStep.latitude);
      }
      if (extraStep.longitude) {
          formData.append(`extra_step_longitude_${index}`, extraStep.longitude);
      }
      
    });
    for (let key of (formData as any).keys()) {
    }
    
    return formData;
  }
  openInput(fileInput: ElementRef) {
    fileInput.nativeElement.click();
  }
  

  onFileSelect(event: any, field: string) {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      this.tourForm.get(field)?.setValue(file);

      let elementId = '';

      if (field.startsWith('extraSteps')) {
        const [_, index, subField] = field.split('.');
        if (subField === 'image') {
          elementId = 'nombreImagenExtra' + index;
        } else if (subField === 'audio') {
          elementId = 'nombreAudioExtra' + index;
        }
      } else {
      switch(field) {
        case 'imagen':
          elementId = 'nombreImagen';
          break;
        case 'audio':
          elementId = 'nombreAudio';
          break;
      }
    }
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
      displayElement.textContent = file.name;
    }
  }
}


}