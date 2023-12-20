import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/enviroment/enviroment';




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

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
      this.loadTourRecords();
  }

  loadTourRecords(): void {
    const accessToken = this.authService.getToken();
    if (accessToken) {
        const decodedToken: any = jwtDecode(accessToken);
        const userId = decodedToken.user_id;  
        this.http.get(`${environment.apiUrl}api/get_user_tour_records?id=${userId}`).subscribe(data => {
            this.tourRecords = (data as any)['tours'];
          }, (error: any) => {
            console.error('Error al cargar los registros de tours:', error);
        });
    }
  }
}