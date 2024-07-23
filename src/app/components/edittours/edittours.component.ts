import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EdittoursService } from 'src/app/services/edittours.service';
import { StepService } from 'src/app/services/step.service';

@Component({
  selector: 'app-edittours',
  templateUrl: './edittours.component.html',
  styleUrls: ['./edittours.component.scss']
})
export class EdittoursComponent {
  tourForm: FormGroup; 
  tour_id: string = '';
  image_url!: string;
  aud_url!:string;

  constructor(
    private fb: FormBuilder,
    private stepService: StepService, 
    private activatedRoute: ActivatedRoute,
    private edittoursService: EdittoursService
  ) {
    this.tourForm = this.fb.group({
      titulo: [''],
      descripcion: [''],
      latitude: [''],
      longitude: [''],
      duracion: [''],
      recorrido: [''],
      idioma: [''],
      tipo_de_tour: [''],
      steps: this.fb.array([])
    });
  }
  
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.tour_id = params['id'];
      this.loadTourDetails();
    });
  }

  loadTourDetails() {
    this.stepService.getTourDetail(this.tour_id).subscribe((res: any) => {
      this.tourForm.patchValue({
        titulo: res.titulo,
        descripcion: res.description,
        latitude: res.latitude,
        longitude: res.longitude,
        duracion: res.duracion,
        recorrido: res.recorrido,
        idioma: res.idioma,
        tipo_de_tour: res.tipo_de_tour   
      });

      this.steps.clear();
      res.steps.forEach((step: any) => this.addStep(step));
    });
  }

  get steps() {
    return this.tourForm.get('steps') as FormArray;
  }

  addStep(stepData: any) {
    this.steps.push(this.fb.group({
      id: [stepData.id],
      image: [stepData.image],
      audio: [stepData.audio],
      latitude: [stepData.latitude],
      longitude: [stepData.longitude],
      description: [stepData.description],
      tittle: [stepData.tittle],
      stepNumber: [stepData.stepNumber]
    }));
  }

  updateTour() {
    const formData = new FormData();
    formData.append('titulo', this.tourForm.get('titulo')?.value);
    formData.append('descripcion', this.tourForm.get('descripcion')?.value);
    formData.append('latitude', this.tourForm.get('latitude')?.value);
    formData.append('longitude', this.tourForm.get('longitude')?.value);
    formData.append('duracion', this.tourForm.get('duracion')?.value);
    formData.append('recorrido', this.tourForm.get('recorrido')?.value);
    formData.append('idioma', this.tourForm.get('idioma')?.value);
    formData.append('tipo_de_tour', this.tourForm.get('tipo_de_tour')?.value);
    this.steps.controls.forEach((control: AbstractControl, index: number) => {
      const stepGroup = control as FormGroup;
      const step = stepGroup.value;
    
      formData.append(`steps[${index}][id]`, step.id);
      formData.append(`steps[${index}][latitude]`, step.latitude);
      formData.append(`steps[${index}][longitude]`, step.longitude);
      formData.append(`steps[${index}][description]`, step.description);
      formData.append(`steps[${index}][tittle]`, step.tittle);
      formData.append(`steps[${index}][stepNumber]`, step.stepNumber);

      if (step.image instanceof File) {
        formData.append(`steps[${index}][image]`, step.image);
      }
      if (step.audio instanceof File) {
        formData.append(`steps[${index}][audio]`, step.audio);
      }
    });
    console.log('this.steps.value ', this.steps.value.length);
    this.edittoursService.editTour(this.tour_id, formData, this.steps.value.length).subscribe({
      next: (response: any) => {
        console.log('Tour actualizado con éxito:', response);
      },
      error: (error: any) => {
        console.error('Error al actualizar el tour:', error);
      }
    });
  }    

  onFileChange(event: any, index: number, field: string) {
    const file = event.target.files[0];
    console.log('file ', file, field)
    const type = file.type.split('/')[0];
    const blob = new Blob([file], { type: file.type });
    this.steps.at(index).get(field)?.setValue(file);
    if (type=='image') {
      this.image_url = URL.createObjectURL(blob)
    }else{
      this.aud_url = URL.createObjectURL(blob)
    }
  }
}
