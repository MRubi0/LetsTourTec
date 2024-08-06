import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/enviroment/enviroment';
import { SharedService } from 'src/app/services/shared.service';




export interface Tour {
  id: number;
  title: string;
  date: Date;
  imageUrl: string;
  description: string;
  // otros campos según sean necesarios...
}

@Component({
  selector: 'app-history-tours',
  templateUrl: './history-tours.component.html',
  styleUrls: ['./history-tours.component.scss']
})


export class HistoryToursComponent implements OnInit {
  tourRecords: any[] = [];
  p: number = 1;
  pageSize: number = 12;
  $prof!:any;
  profile:any;
  userId:number=0;
  id:number=0;
  constructor(private http: HttpClient, private authService: AuthService, private sharedService:SharedService) {
    this.$prof=this.sharedService.getProfile;
  }

  ngOnInit() {
    this.$prof.subscribe((data: any) => {
      this.profile = data; 
    });
      this.loadTourRecords(); 
  }

  loadTourRecords(): void {
    const accessToken = this.authService.getToken();
    console.log('this.userId 1', accessToken)
    if (accessToken) {     
        const decodedToken: any = jwtDecode(accessToken);
        this.id = decodedToken.user_id; 
        console.log('this.userId 2', this.id)     
    }
    if(this.profile.id){
      if(this.id==this.profile.id){
        this.userId=this.id;
        console.log('this.userId 3', this.id) 
      }
      else{
        this.userId=this.profile.id;
        console.log('this.userId 4', this.userId) 
      } 
    }else{
      this.userId=this.id;
    }       
    console.log('this.userId ', this.userId)
    this.http.get(`${environment.apiUrl}api/get_user_tour_records?id=${this.userId}`).subscribe(data => {
        this.tourRecords = (data as any)['tours'];
      }, (error: any) => {
        console.error('Error al cargar los registros de tours:', error);
    });
  }
}