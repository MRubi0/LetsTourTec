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
  tourRecords: any[] = []; // Tus registros de tours con valoraciones incluidas
  p: number = 1; // La página actual para la paginación
  pageSize: number = 12; // La cantidad de elementos por página
  $prof!:any;
  profile:any;
  userId:number=0;
  constructor(private http: HttpClient, private authService: AuthService, private sharedService:SharedService) {
    this.$prof=this.sharedService.getProfile;
  }

  ngOnInit() {
    this.$prof.subscribe((data: any) => {
      this.profile = data;  
      console.log('this.profile history', this.profile);  
    });
      this.loadTourRecords(); 
  }

  loadTourRecords(): void {
    const accessToken = this.authService.getToken();
    if (accessToken) {     
        const decodedToken: any = jwtDecode(accessToken);
        const userId = decodedToken.user_id;
        
        if(userId==this.profile.id){
          this.userId=userId;
        }
        else{
          this.userId=this.profile.id;
        }     
        this.http.get(`${environment.apiUrl}api/get_user_tour_records?id=${this.userId}`).subscribe(data => {
            this.tourRecords = (data as any)['tours'];
          }, (error: any) => {
            console.error('Error al cargar los registros de tours:', error);
        });
    }
  }
}