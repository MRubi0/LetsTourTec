import { AfterViewChecked, Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent{

  lastTours:any;

  constructor(private latestToursService:LatestToursService){

  }
  ngOnInit(){
    this.latestToursService.getClosestTours().subscribe((data:any)=>{
      this.lastTours=data;
    });
  }

  lastToursF(){
    this.latestToursService.getLastestTours().subscribe((data:any)=>{
      this.lastTours=data;
    });
  }
  randomToursF(){
    this.latestToursService.getRadomTours().subscribe((data:any)=>{
      this.lastTours=data;
    });
  }

}
