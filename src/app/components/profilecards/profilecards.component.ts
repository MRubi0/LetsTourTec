import { Component, Input } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-profilecards',
  templateUrl: './profilecards.component.html',
  styleUrls: ['./profilecards.component.scss']
})
export class ProfilecardsComponent {
  $prof!:any;
  profile:any;

  constructor(private sharedService:SharedService){
    this.$prof=this.sharedService.getProfile;
  }
  ngOnInit(){
    this.$prof.subscribe((data: any) => {
      this.profile = data; 
      console.log('this.profile ', this.profile);     
    });    
  }

 }
