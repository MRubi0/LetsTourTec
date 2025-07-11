import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/enviroment/enviroment';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-my-tours',
  templateUrl: './my-tours.component.html',
  styleUrls: ['./my-tours.component.scss']
})
export class MyToursComponent {
  tours: any[] = [];
  profile:any;
  $prof!:any;
  userId:number=0;
  id:number=0;

  constructor(private http: HttpClient, private authService: AuthService, private sharedService:SharedService) {
    this.$prof=this.sharedService.getProfile;
  }

  ngOnInit() {    
    this.$prof.subscribe((data: any) => {
      this.profile = data;  
    });
      this.loadTours();
  }

  loadTours(): void {
    const accessToken = this.authService.getToken();
    if (accessToken) {
        const decodedToken: any = jwtDecode(accessToken);
        this.id = decodedToken.user_id;        
    }
    if(this.profile.id){
      if(this.id==this.profile.id){
        this.userId=this.id;
      }
      else{
        this.userId=this.profile.id;
      }
    }else{
      this.userId=this.id;
    }   
    this.http.get(`${environment.apiUrl}get_user_tours?id=${this.userId}`).subscribe(data => {
        this.tours = (data as any)['tours'];
    }, error => {
        console.error('Error al cargar los tours:', error);
    });
  }
}
