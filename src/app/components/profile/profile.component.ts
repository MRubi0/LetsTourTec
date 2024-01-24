import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { ProfileService } from 'src/app/services/profile.service';
import { jwtDecode } from 'jwt-decode';
import { SnackService } from 'src/app/services/snack.service';
import { MatSnackBar } from '@angular/material/snack-bar';




@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profile:any;
  constructor(private router: Router, private profileservice:ProfileService, 
    private snackbarService:SnackService) {}

  ngOnInit(){
    let decodedToken!:any;
    const token = localStorage.getItem('access_token');
    if (token !== null) {
        decodedToken = jwtDecode(token);
        console.log(decodedToken);
    } else {
        console.error('No se encontró el token en el localStorage.');
    }    
    this.profileservice.getProfile(decodedToken.user_id).subscribe((profile:any)=>{
      this.profile=profile.user;
    })
  }

  uploadTour() {
    this.router.navigate(['/upload-tour']);
  }

  editProfile() {
    console.log("falta esto");
  }

  History() {
    console.log("falta esto");
    this.snackbarService.openSnackBar('Cargado correctamente',
    'OK');
  }
  toursUploaded() {
    console.log("falta esto")
    this.router.navigate(['/my-tours']);
  } 
}