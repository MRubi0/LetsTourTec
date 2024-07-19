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
  profile: any;
  userId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService, private sharedService: SharedService) {}

  ngOnInit() {
    // Corrigiendo la llamada a getProfile
    this.sharedService.getProfile.subscribe((data: any) => {
      this.profile = data;
      this.setUserId();
      this.loadTourRecords();
    });
  }

  setUserId(): void {
    const accessToken = this.authService.getToken();
    if (accessToken) {
      const decodedToken: any = jwtDecode(accessToken);
      this.userId = decodedToken.user_id || this.profile.id;
    } else {
      this.userId = this.profile.id;
    }

    if (!this.userId) {
      console.error('Error: userId is undefined');
    }
  }

  loadTourRecords(): void {
    if (!this.userId) {
      console.error('Error: userId is undefined');
      return;
    }


    this.http.get(`${environment.apiUrl}api/get_user_tour_records?id=${this.userId}`).subscribe(data => {
      this.tourRecords = (data as any)['tours'];
    }, (error: any) => {
      console.error('Error al cargar los registros de tours:', error);
    });


    // this.http.get(`${environment.apiUrl}api/get_user_tour_records`, {
    //   params: { id: this.userId.toString(), language: lang }
    // }).subscribe(data => {
    //   this.tourRecords = (data as any)['tours'];
    // }, (error: any) => {
    //   console.error('Error al cargar los registros de tours:', error);
    // });




  }
}