import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EdittoursService } from 'src/app/services/edittours.service';
import { SnackService } from 'src/app/services/snack.service';
import { StepService } from 'src/app/services/step.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragedittoursComponent } from '../dragedittours/dragedittours.component';
import { ContentObserver } from '@angular/cdk/observers';

@Component({
  selector: 'app-edittours',
  templateUrl: './edittours.component.html',
  styleUrls: ['./edittours.component.scss']
})
export class EdittoursComponent implements OnInit {
  tourForm: FormGroup;
  tour_id: string = '';
  image_url_tour!: string;
  aud_url_tour!: string;
  deleting_steps: number[] = [];
  loading = false;
  disabled = false;
  screenWidth: number = window.innerWidth;
  screenHeight: number = window.innerHeight;
  step_audios:Array<string>=[];
  velocity_rate:number=1;
  volumen_rate:number=0.5;
  rates=0;

  constructor(
    private fb: FormBuilder,
    private stepService: StepService,
    private activatedRoute: ActivatedRoute,
    private edittoursService: EdittoursService,
    private snackbarService: SnackService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
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
    this.tourForm.valueChanges.subscribe((data:any)=>{
      console.log('data -->', data);
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
          image: res.image,
          audio: res.audio,    
          tipo_de_tour: res.tipo_de_tour
        });
  
        this.steps.clear();
        res.steps.forEach((step: any, index: number) => {
          this.addStep({ ...step, stepNumber: index + 1 });
        });
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
  
  updateSteps(steps: any[]) {
    this.steps.clear();
    steps.forEach((stepData, index) => {
      this.addStep({ ...stepData, stepNumber: index + 1 });
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
      imageUrl: [null],
      audioUrl: [null],
      latitude: [stepData.latitude],
      longitude: [stepData.longitude],
      description: [stepData.description],
      tittle: [stepData.tittle],
      stepNumber: [stepData.stepNumber]
    }));
  }

  openMapModal(form: any): void {
    const dialogRef = this.dialog.open(DragedittoursComponent, {
      panelClass: 'custom-modal',
      data: { form }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const blobUrlPattern = /^blob:http(s)?:\/\/.+/;
        result = result.map((data:any, index:number)=>{
          console.log('type ', typeof data.image)
          const stepFormGroup = this.steps.at(index) as FormGroup;          
          
          if (blobUrlPattern.test(data.image)) {
            console.log('Image URL is a blob:', data.image);
            data.image = stepFormGroup.get('image')?.value;
          }

          return data;
        }); 
        this.updateSteps(result);        
        this.updateTourModal();
      }
    });
  }

  updateTourModal() {
    this.loading = true;
    this.tourForm.disable();
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
    if (this.tourForm.get('image')?.value instanceof File) {
      formData.append('image', this.tourForm.get('image')?.value);
    }
    if (this.tourForm.get('audio')?.value instanceof File) {
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
       
      console.log('image ', step.image, step.image instanceof File);
      if (step.image instanceof File) {
        formData.append(`steps[${index}][image]`, step.image);
      }
      if (step.audio instanceof File) {
        formData.append(`steps[${index}][audio]`, step.audio);
      }
    });

    this.edittoursService.editTour(this.tour_id, formData, this.steps.value.length).subscribe({
      next: (response: any) => {
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
    //this.disabled = true;
  }
  updateTour(){        
    this.openMapModal(this.tourForm.value.steps);    
  }

  onFileChange(event: any, index: number | 'tour', field: string) {
    const file = event.target.files[0];
    const type = file.type.split('/')[0];
    const blob = new Blob([file], { type: file.type });
  
    if (index === 'tour') {
      this.tourForm.get(field)?.setValue(file);
      if (type === 'image') {
        this.image_url_tour = URL.createObjectURL(blob);
      } else {
        this.aud_url_tour = URL.createObjectURL(blob);
      }
    } else {
      const stepFormGroup = this.steps.at(index) as FormGroup;
      stepFormGroup.get(field)?.setValue(file);
      if (type === 'image') {
        stepFormGroup.get('imageUrl')?.setValue(URL.createObjectURL(blob));
        stepFormGroup.get('image')?.setValue(file);
      } else {
        stepFormGroup.get('audioUrl')?.setValue(URL.createObjectURL(blob));
        stepFormGroup.get('audio')?.setValue(file);
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
      imageUrl: [null],
      audioUrl: [null],
      latitude: [''],
      longitude: [''],
      description: [''],
      tittle: [''],
      stepNumber: ['']
    }));
  }

  drop(event: CdkDragDrop<string[]>) {
    const previousIndex = this.steps.controls.findIndex((d) => d === event.item.data);
    moveItemInArray(this.steps.controls, previousIndex, event.currentIndex);
    this.steps.controls.forEach((control, index) => {
      control.get('stepNumber')?.setValue(index);
    });
  }
  velocity(event:any){
    this.velocity_rate=event;
  }
  volumen(event:any){
    this.volumen_rate=event;
  }
}
