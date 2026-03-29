import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackService } from 'src/app/services/snack.service';
import { UploadTourService } from 'src/app/services/upload-tour.service';
import { TranslateService } from '@ngx-translate/core';

const DRAFT_KEY = 'ltt_tour_draft';

@Component({
  selector: 'app-upload-tour',
  templateUrl: './upload-tour.component.html',
  styleUrls: ['./upload-tour.component.scss']
})
export class UploadTourComponent implements OnInit {
  tourForm: FormGroup;
  loading = false;
  hasDraft = false;
  imagenFileName = '';
  audioFileName = '';
  private autoSaveTimer: any;

  opciones = [
    { value: 'cultural', labelKey: 'GENERIC-CARD.Cultural' },
    { value: 'leisure',  labelKey: 'GENERIC-CARD.Leisure' },
    { value: 'nature',   labelKey: 'GENERIC-CARD.Nature' },
  ];

  constructor(
    private fb: FormBuilder,
    private uploadTourService: UploadTourService,
    private snackService: SnackService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.tourForm = this.fb.group({
      tipo_de_tour: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: [''],
      audio: [''],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      duracion: ['', Validators.required],
      recorrido: ['', Validators.required],
      extraSteps: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.hasDraft = !!localStorage.getItem(DRAFT_KEY);
    this.tourForm.valueChanges.subscribe(() => {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.saveDraft(), 1500);
    });
  }

  get extraSteps() {
    return this.tourForm.get('extraSteps') as FormArray;
  }

  addExtraStep() {
    this.extraSteps.push(this.fb.group({
      tittle: [''],
      description: [''],
      latitude: [''],
      longitude: [''],
      image: [''],
      audio: [''],
      imageFileName: [''],
      audioFileName: ['']
    }));
  }

  removeExtraStep(index: number): void {
    this.extraSteps.removeAt(index);
  }

  // ── Draft ──────────────────────────────────────────────

  saveDraft(): void {
    const v = this.tourForm.value;
    const draft = {
      tipo_de_tour: v.tipo_de_tour,
      titulo: v.titulo,
      descripcion: v.descripcion,
      latitude: v.latitude,
      longitude: v.longitude,
      duracion: v.duracion,
      recorrido: v.recorrido,
      extraSteps: v.extraSteps.map((s: any) => ({
        tittle: s.tittle,
        description: s.description,
        latitude: s.latitude,
        longitude: s.longitude
      }))
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    this.hasDraft = true;
  }

  restoreDraft(): void {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    this.tourForm.patchValue({
      tipo_de_tour: draft.tipo_de_tour || '',
      titulo: draft.titulo || '',
      descripcion: draft.descripcion || '',
      latitude: draft.latitude || '',
      longitude: draft.longitude || '',
      duracion: draft.duracion || '',
      recorrido: draft.recorrido || ''
    });
    (draft.extraSteps || []).forEach((s: any) => {
      this.extraSteps.push(this.fb.group({
        tittle: [s.tittle || ''],
        description: [s.description || ''],
        latitude: [s.latitude || ''],
        longitude: [s.longitude || ''],
        image: [''],
        audio: [''],
        imageFileName: [''],
        audioFileName: ['']
      }));
    });
    this.hasDraft = false;
    this.snackService.openSnackBar(this.translate.instant('UPLOAD-TOUR.Draft_restored'), 'OK');
  }

  discardDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
    this.hasDraft = false;
  }

  private clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
    this.hasDraft = false;
  }

  // ── Submit ─────────────────────────────────────────────

  submitTour() {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      this.snackService.openSnackBar(this.translate.instant('UPLOAD-TOUR.Validation_error'), 'OK');
      return;
    }
    const formData = this.prepareSave();
    this.loading = true;
    this.uploadTourService.uploadTour(formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.clearDraft();
        this.snackService.openSnackBar(response.message, 'OK');
        this.router.navigate(['/my-tours']);
      },
      error: () => {
        this.loading = false;
        this.snackService.openSnackBar(this.translate.instant('UPLOAD-TOUR.Submit_error'), 'OK');
      }
    });
  }

  private prepareSave(): FormData {
    const v = this.tourForm.value;
    const formData = new FormData();
    const lang: string = localStorage.getItem('language') ?? 'es';
    const idioma_destino = lang === 'es' ? 'en' : 'es';

    formData.append('tipo_de_tour', v.tipo_de_tour);
    formData.append('titulo', v.titulo);
    formData.append('descripcion', v.descripcion);
    formData.append('latitude', v.latitude);
    formData.append('longitude', v.longitude);
    formData.append('duracion', v.duracion);
    formData.append('recorrido', v.recorrido);
    formData.append('idioma', lang);
    formData.append('idioma_destino', idioma_destino);

    if (this.tourForm.get('imagen')?.value) {
      formData.append('imagen', this.tourForm.get('imagen')?.value);
    }
    if (this.tourForm.get('audio')?.value) {
      formData.append('audio', this.tourForm.get('audio')?.value);
    }

    v.extraSteps.forEach((step: any, i: number) => {
      if (step.tittle)       formData.append(`tittle_${i}`, step.tittle);
      if (step.description)  formData.append(`description_${i}`, step.description);
      if (step.latitude)     formData.append(`extra_step_latitude_${i}`, step.latitude);
      if (step.longitude)    formData.append(`extra_step_longitude_${i}`, step.longitude);
      if (step.image)        formData.append(`extra_step_image_${i}`, step.image);
      if (step.audio)        formData.append(`extra_step_audio_${i}`, step.audio);
    });

    return formData;
  }

  // ── Archivos ───────────────────────────────────────────

  onFileSelect(event: any, field: string, stepIndex?: number): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (stepIndex !== undefined) {
      const step = this.extraSteps.at(stepIndex);
      if (field === 'image') {
        step.patchValue({ image: file, imageFileName: file.name });
      } else {
        step.patchValue({ audio: file, audioFileName: file.name });
      }
    } else {
      this.tourForm.get(field)?.setValue(file);
      if (field === 'imagen') this.imagenFileName = file.name;
      if (field === 'audio') this.audioFileName = file.name;
    }
  }
}
