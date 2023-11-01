import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToursDetailService } from 'src/app/services/tours-detail.service';

@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss']
})
export class TourDetailComponent {

  detail:any;
  $url!:any;
  image_url:string='';
  constructor(
    private toursDetailService:ToursDetailService,
    private activatedRoute:ActivatedRoute,
    private sharedService:SharedService,
    private router:Router,
    ){
      this.$url=this.sharedService.getImage;
      
  }

  ngOnInit(){    
  this.activatedRoute.params.subscribe((params:any)=>{
      this.loadData(params.id);
    });   
  }
  loadData(id:any){
    this.toursDetailService.getTourDetail(id).subscribe((data:any)=>{
      this.detail=data[0].fields;
    });
    this.$url.subscribe((url:any)=>{
      this.image_url=url;      
    });
  }
  letsTour(data:any){
    this.sharedService.setCoordinates=data;
    this.router.navigate([`/maps/${data.latitude}/${data.longitude}`]);
  }  
}
