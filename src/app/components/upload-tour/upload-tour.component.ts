import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UploadTourService } from 'src/app/services/upload-tour.service'


@Component({
  selector: 'app-upload-tour',
  templateUrl: './upload-tour.component.html',
  styleUrls: ['./upload-tour.component.scss']
})
export class UploadTourComponent implements OnInit{
  tourForm: FormGroup;
  MAX_EXTRA_STEPS = 100;
  @ViewChild('imagenInput') imagenInputElement!: ElementRef;
  @ViewChild('audioInput') audioInputElement!: ElementRef;

  opciones = [
    { value: 'cultural', viewValue: 'Cultural Tour' },
    { value: 'leisure', viewValue: 'Leisure Tour' },
    { value: 'nature', viewValue: 'Nature Tour' },
  ];

  constructor(private fb: FormBuilder, private uploadTourService: UploadTourService) {
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
        description: ''
      });
      this.extraSteps.push(extraStepGroup);
    }
  }
  removeExtraStep(index: number): void {
    this.extraSteps.removeAt(index);
  }

    

  submitTour() {
    const formData = this.prepareSave();
    this.uploadTourService.uploadTour(formData).subscribe(
      (response: any) => {
        
        console.log("Tour uploaded successfully", response);
      },
      (error: any) => {
        
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
      if (extraStep.image) {
        formData.append(`extra_step_image_${index}`, extraStep.image);
      }
      if (extraStep.audio) {
        formData.append(`extra_step_audio_${index}`, extraStep.audio);
        console.log(extraStep.audio)
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
      console.log(key, formData.get(key));
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
    }
  }
}


