import { Component, Input, ViewChild } from '@angular/core';
import { PaginationControlsComponent } from 'ngx-pagination';
import { SharedService } from 'src/app/services/shared.service';
import { TranslateService } from '@ngx-translate/core';




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

  p: number=1;
  pageSize:number=12;
  autoHide=true
  responsive=true
  showMore=false;

  constructor(private sharedService: SharedService, private translate: TranslateService) {}

  ngOnChanges() {
    this.toursdata.forEach((tour: any) => {
      this.showFullDescription[tour.id] = false;
  
      // Obtener la media de valoraciones para cada tour
      console.log(tour.id)
      this.sharedService.getMediaValoraciones(tour.id).subscribe({
        next: (response:any) => {
          tour.mediaValoracion = response.media_puntuacion;
        },
        error: (error:any) => {
          console.error('Error al obtener la media de valoraciones:', error);
        }
      });
    });
    this.toursdata.map((data:any)=>{
      
      const partofUrl = data.imagen.url.split('/');
      const nombreDeImagen = partofUrl[partofUrl.length - 1];

      data.imagen.url=nombreDeImagen;
      

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
  
}
