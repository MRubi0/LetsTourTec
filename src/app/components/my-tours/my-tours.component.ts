import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-my-tours',
  templateUrl: './my-tours.component.html',
  styleUrls: ['./my-tours.component.scss']
})
export class MyToursComponent {
  tours: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
      this.loadTours();
  }

  loadTours(): void {
    const accessToken = this.authService.getToken();
    if (accessToken) {
        const decodedToken: any = jwtDecode(accessToken);
        const userId = decodedToken.user_id;  
        this.http.get(`http://localhost:8000/api/get_user_tours?id=${userId}`).subscribe(data => {
            this.tours = (data as any)['tours'];
        }, error => {
            console.error('Error al cargar los tours:', error);
        });
    }
  }
}
