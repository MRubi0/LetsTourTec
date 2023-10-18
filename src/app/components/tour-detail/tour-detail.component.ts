import { Component } from '@angular/core';
import { ToursDetailService } from 'src/app/services/tours-detail.service';

@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss']
})
export class TourDetailComponent {

  detail:any;

  constructor(private toursDetailService:ToursDetailService){

  }

  ngOnInit(){

    this.toursDetailService.getTourDetail('13').subscribe((data:any)=>{
      this.detail=data[0].fields;
      console.log(this.detail);
    });
  }
}
