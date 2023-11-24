import { Component, Input } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss']
})
export class GenericCardComponent {
  public showFullDescription: { [key: number]: boolean } = {};

  @Input('toursdata') toursdata:any=[];
  @Input('all-tours') view!:boolean;

  p!: number;
  pageSize:number=12;
  autoHide=true
  responsive=true
  showMore=false;

  constructor(private sharedService:SharedService){}

  ngOnChanges(){
    this.toursdata.forEach((tour: any) => {
      this.showFullDescription[tour.id] = false;
  });
    this.toursdata.map((data:any)=>{
      
      const partofUrl = data.imagen.url.split('/'); // Divide la URL en partes usando '/' como separador
      const nombreDeImagen = partofUrl[partofUrl.length - 1];

      data.imagen.url=nombreDeImagen;

      if(data.tipo_de_tour=='ocio'){
        data.tipo_de_tour='Leisure';
      }
      if(data.tipo_de_tour=='naturaleza'){
        data.tipo_de_tour='Nature';
      }
      if(data.tipo_de_tour=='cultural'){
        data.tipo_de_tour='Cultural';
      }
      return data;
    });   
  }
  sendImage(image:string){
    console.log('image -->', image);
    //this.sharedService.setImage=image;
  }
  stopClickPropagate(event: Event): void {
    event.stopPropagation();
}
toggleDescription(event: Event, tourId: number): void {
  event.stopPropagation();
  this.showFullDescription[tourId] = !this.showFullDescription[tourId];
}


}
