import { Component } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  emailOfUser: string = 'variable_email'; 
  constructor(private router: Router) {}

  uploadTour() {
    this.router.navigate(['/upload-tour']);
  }

  editProfile() {
    console.log("falta esto")
  }

  History() {
    console.log("falta esto")
  }
}