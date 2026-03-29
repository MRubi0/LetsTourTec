import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from 'src/app/services/profile.service';
import { SharedService } from 'src/app/services/shared.service';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/enviroment/enviroment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profile: any;
  toursCount: number = 0;
  loading = true;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private sharedService: SharedService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const decoded: any = jwtDecode(token);
    this.profileService.getProfile(decoded.user_id).subscribe((res: any) => {
      this.profile = res.user;
      this.sharedService.setProfile = res.user;
      this.http.get(`${environment.apiUrl}get_user_tours?id=${decoded.user_id}`).subscribe((data: any) => {
        const tours = data.tours || [];
        this.toursCount = tours.filter((t: any) => t.original === 'original').length;
        this.loading = false;
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
