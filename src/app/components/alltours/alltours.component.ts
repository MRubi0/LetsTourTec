import { Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-alltours',
  templateUrl: './alltours.component.html',
  styleUrls: ['./alltours.component.scss']
})
export class AlltoursComponent {

  alltours:any;
  constructor(private latestToursService:LatestToursService){

  }

  ngOnInit(){
    this.latestToursService.getAllTours().subscribe((data=>{
      this.alltours=data;
    }));
  }
}
