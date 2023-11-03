import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  authenticationError = false;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  
  constructor(
    private authService: AuthService,
    private loggingService: LoggingService,
    private cookieService: CookieService
  ) { }


  ngOnInit(){

    this.loginForm.valueChanges.subscribe(data=>{
      console.log(data);
    });
  }

  onSubmit() { 

    const username = this.loginForm.get('username')?.value || '';
    const password = this.loginForm.get('password')?.value || '';

    this.authService.login({ username, password }).subscribe( 
      (response: any) => {
        this.loggingService.log('Login successful: ' + JSON.stringify(response));
        console.log(response);
      },
      (error: any) => {
        this.loggingService.error('Login error: ' + JSON.stringify(error));
        console.log(error);
        this.authenticationError = true;
      }
    );
}

}
