import { Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';
import { SnackService } from 'src/app/services/snack.service';
import { ValidateService } from 'src/app/services/validate.service';

@Component({
  selector: 'app-validate-tours',
  templateUrl: './validate-tours.component.html',
  styleUrls: ['./validate-tours.component.scss']
})
export class ValidateToursComponent {
  constructor(private latestToursService:LatestToursService, private validateService:ValidateService,
    private snackService:SnackService
  ){}
  alltours:any;

  ngOnInit(){
    this.loadTours();  
  }
  loadTours(){
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = String(position.coords.latitude);
      const longitud = String(position.coords.longitude);
      this.latestToursService.getAllToursValidation().subscribe((data=>{
        this.alltours=data;
      }));
    }) 
  }
  validate(data:any){
    this.validateService.validateTour(data).subscribe((data:any)=>{
      this.snackService.openSnackBar(data.message, 'ok');
      this.loadTours(); 
    },
    (error:any)=>{
      this.snackService.openSnackBar(error.error, 'error');
    }
  );
  }
}
