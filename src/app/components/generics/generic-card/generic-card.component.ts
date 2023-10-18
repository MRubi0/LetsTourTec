import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss']
})
export class GenericCardComponent {

  @Input('toursdata') toursdata:any=[];
  @Input('all-tours') view!:boolean;

  p!: number;
  pageSize:number=10;
  autoHide=true
  responsive=true

  ngOnInit(){
    this.toursdata.map((data:any)=>{
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

}
