import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/enviroment/enviroment';
import { SharedService } from 'src/app/services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { VotacionModalComponent } from '../votacion-modal/votacion-modal.component';

@Component({
  selector: 'app-history-tours',
  templateUrl: './history-tours.component.html',
  styleUrls: ['./history-tours.component.scss']
})
export class HistoryToursComponent implements OnInit {
  tourRecords: any[] = [];
  profile: any;
  userId: number | null = null;
  starPositions = [1, 2, 3, 4, 5];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
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
      this.userId = decodedToken.user_id || this.profile?.id;
    } else {
      this.userId = this.profile?.id;
    }
  }

  loadTourRecords(): void {
    if (!this.userId) return;
    const lang: string = localStorage.getItem('language') ?? 'es';
    this.http.get(`${environment.apiUrl}get_user_tour_records`, {
      params: { id: this.userId.toString(), language: lang }
    }).subscribe((data: any) => {
      this.tourRecords = data['tours'] || [];
    });
  }

  openEditValoracion(tour: any, valoracion: any) {
    const ref = this.dialog.open(VotacionModalComponent, {
      data: {
        tourId: tour.id,
        puntuacion: valoracion?.puntuacion || null,
        comentario: valoracion?.comentario || ''
      },
      width: '340px'
    });

    ref.afterClosed().subscribe(() => {
      this.loadTourRecords();
    });
  }
}
