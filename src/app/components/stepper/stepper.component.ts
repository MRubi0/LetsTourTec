import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConnectableObservable } from 'rxjs';
import { StepService } from 'src/app/services/step.service';
import { environment } from 'src/enviroment/enviroment';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;

  tour:any;

  url=environment.bucket;

  constructor(private _formBuilder: FormBuilder, private stepService:StepService) {}

  ngOnInit(){}
  ngAfterViewInit(){
    this.data();
  }

  data(){
    this.stepService.getTourDetail('78').subscribe((data=>{
      this.tour=data;
      console.log('data ---->', data);
    }));
  }
}
