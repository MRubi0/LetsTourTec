import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EdittoursService } from 'src/app/services/edittours.service';
import { SnackService } from 'src/app/services/snack.service';
import { StepService } from 'src/app/services/step.service';

@Component({
  selector: 'app-edittours',
  templateUrl: './edittours.component.html',
  styleUrls: ['./edittours.component.scss']
})
export class EdittoursComponent implements OnInit {
  tourForm: FormGroup; 
  tour_id: string = '';
  image_url!: string;
  aud_url!: string;
  image_url_tour!:string;
  aud_url_tour!: string;
  deleting_steps: number[] = [];
  loading = false;
  disabled=false;

  constructor(
    private fb: FormBuilder,
    private stepService: StepService, 
    private activatedRoute: ActivatedRoute,
    private edittoursService: EdittoursService,
    private snackbarService: SnackService
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
      image: [''],
      audio: [''],
      steps: this.fb.array([])
    });
  }
  
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.tour_id = params['id'];
      this.loadTourDetails();
    });
    this.tourForm.valueChanges.subscribe(data=>{
      console.log('res ---> ', data);
    });
  }

  loadTourDetails() {
    this.loading = true;
    this.stepService.getTourDetail(this.tour_id).subscribe({
      next: (res: any) => {
        this.tourForm.patchValue({
          titulo: res.titulo,
          descripcion: res.description,
          latitude: res.latitude,
          longitude: res.longitude,
          duracion: res.duracion,
          recorrido: res.recorrido,
          idioma: res.idioma,
          image:res.image,
          audio:res.audio,
          tipo_de_tour: res.tipo_de_tour   
        });

        this.steps.clear();
        res.steps.forEach((step: any) => this.addStep(step));
        this.loading = false;
        this.tourForm.enable();
        this.snackbarService.openSnackBar('Cargado correctamente', 'OK');  
      },
      error: (error: any) => {
        console.error('Error al cargar los detalles del tour:', error);
        this.loading = false;
        this.snackbarService.openSnackBar('Error al cargar los detalles del tour', 'OK');
      }
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
    this.loading = true;
    this.tourForm.disable();
    this.disabled = true;
    const formData = new FormData();
    formData.append('titulo', this.tourForm.get('titulo')?.value);
    formData.append('descripcion', this.tourForm.get('descripcion')?.value);
    formData.append('latitude', this.tourForm.get('latitude')?.value);
    formData.append('longitude', this.tourForm.get('longitude')?.value);
    formData.append('duracion', this.tourForm.get('duracion')?.value);
    formData.append('recorrido', this.tourForm.get('recorrido')?.value);
    formData.append('idioma', this.tourForm.get('idioma')?.value);
    formData.append('tipo_de_tour', this.tourForm.get('tipo_de_tour')?.value);
    formData.append('deleting', JSON.stringify(this.deleting_steps));
    console.log('here');
    if (this.tourForm.get('image')?.value instanceof File) {
      console.log('here 1');
      formData.append('image', this.tourForm.get('image')?.value);
    }
    if (this.tourForm.get('audio')?.value instanceof File) {
      console.log('here 2');
      formData.append('audio', this.tourForm.get('audio')?.value);
    }
  
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
  
    this.edittoursService.editTour(this.tour_id, formData, this.steps.value.length).subscribe({
      next: (response: any) => {
        console.log('Tour actualizado con éxito:', response);
        this.loading = false;
        this.snackbarService.openSnackBar('Tour actualizado con éxito', 'OK');
      },
      error: (error: any) => {
        console.error('Error al actualizar el tour:', error);
        this.loading = false;
        this.tourForm.enable();
        this.snackbarService.openSnackBar('Error al actualizar el tour', 'OK');
      }
    });
  }
  
  
  onFileChange(event: any, index: number | 'tour', field: string) {
    const file = event.target.files[0];
    const type = file.type.split('/')[0];
    const blob = new Blob([file], { type: file.type });    
    if (index === 'tour') {
      console.log('index--> ', field, file);
      this.tourForm.get(field)?.setValue(file);
      if (type == 'image') {
        this.image_url_tour = URL.createObjectURL(blob);
      } else {
        this.aud_url_tour = URL.createObjectURL(blob);
      }
    } else {
      this.steps.at(index).get(field)?.setValue(file);
      if (type == 'image') {
        this.image_url = URL.createObjectURL(blob);
      } else {
        this.aud_url = URL.createObjectURL(blob);
      }
    }
  }
  
  
  deleteStep(index: number): void {
    const stepId = this.steps.at(index).get('id')?.value;
    this.steps.removeAt(index);

    if (stepId) {
      this.deleting_steps.push(stepId);
    }
  }

  addNewStep() {
    this.steps.push(this.fb.group({
      id: [''],
      image: [''],
      audio: [''],
      latitude: [''],
      longitude: [''],
      description: [''],
      tittle: [''],
      stepNumber: ['']
    }));
  }
}
