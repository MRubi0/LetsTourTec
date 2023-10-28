import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-Signup',
  templateUrl: './Signup.component.html',
  styleUrls: ['./Signup.component.scss']
})
export class SignupComponent {

  authenticationError = false;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false, [Validators.required]),
  });

  ngOnInit(){
    this.loginForm.valueChanges.subscribe((data:any)=>{
      console.log('data --->', data);
    });

  }
}
