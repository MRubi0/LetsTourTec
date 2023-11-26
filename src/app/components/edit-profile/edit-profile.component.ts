import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})


export class EditProfileComponent implements OnInit {

  profileForm: FormGroup;
  constructor(private fb: FormBuilder) { 
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
  }

  ngOnInit() {
   
  }
  onFileSelect(event: any, fieldName: string) {
    console.log("archivo")
}


updateProfile() {
  
        console.log("success")
     
      }
    
}