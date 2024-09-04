import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PaginationControlsComponent } from 'ngx-pagination';
import { SharedService } from 'src/app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';




@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss']
})
export class GenericCardComponent {
  public showFullDescription: { [key: number]: boolean } = {};

  @ViewChild(PaginationControlsComponent) paginationControls!: PaginationControlsComponent;
  @Input('toursdata') toursdata:any=[];
  @Input('all-tours') view!:boolean; 
  @Input('validate') validate:boolean=false; 
  @Output() check = new EventEmitter<any>();
  p: number=1;
  pageSize:number=12;
  autoHide=true
  responsive=true
  showMore=false;
  show=false;

  constructor(private sharedService: SharedService, private translate: TranslateService, 
    private router: Router, private route: ActivatedRoute
  ) {}

  ngOnInit(){
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      const route = currentRoute.includes('/my-tours');
      this.show=route;
    });
  }

  ngOnChanges() {
    this.toursdata.forEach((tour: any) => {
      this.showFullDescription[tour.id] = false;     
    });
    this.toursdata.map((data:any)=>{
      if(data.tipo_de_tour=='ocio'){
        data.tipo_de_tour='Leisure';
        const translatedKey = `GENERIC-CARD.Leisure`;
        data.translatedTourType = this.translate.instant(translatedKey);
      }
      if(data.tipo_de_tour=='naturaleza'){
        data.tipo_de_tour='Nature';
        const translatedKey = `GENERIC-CARD.Nature`;
        data.translatedTourType = this.translate.instant(translatedKey);
      }
      if(data.tipo_de_tour=='cultural'){
        data.tipo_de_tour='Cultural';
        const translatedKey = `GENERIC-CARD.Cultural`;
        data.translatedTourType = this.translate.instant(translatedKey);
      }
      return data;
    });      
  }
  sendImage(image:string){
    //this.sharedService.setImage=image;
  }
  stopClickPropagate(event: Event): void {
    event.stopPropagation();
}
  toggleDescription(event: Event, tourId: number): void {
    event.stopPropagation();
    this.showFullDescription[tourId] = !this.showFullDescription[tourId];
  }
  scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  onPageChange(): void {
    this.scrollToTop();
  }
  loadUser(user:any){
    const token = localStorage.getItem('access_token');
    if(token){
      const decodedToken:any = jwtDecode(token);
      if(decodedToken.user_id==user.id){
        this.sharedService.setProfile=user; 
        this.router.navigate([ '/profile']);
      }else{
        this.sharedService.setProfile=user; 
        this.router.navigate([ '/profile-card']);
      }      
    }else{
        this.sharedService.setProfile=user; 
        this.router.navigate([ '/profile-card']);
    }        
  }  
  validateTour(tour:any){
    this.check.emit({
      tour_id:tour.id,
      validate:!tour.validado
    });
  }
}
