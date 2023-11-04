import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { LoggingService } from 'src/app/services/logging.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  authenticationError = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  
  constructor(
    private authService: AuthService,
    private loggingService: LoggingService,
    private router: Router,
  ) { }


  ngOnInit(){

    this.loginForm.valueChanges.subscribe(data=>{
      console.log(data);
    });
  }

  onSubmit() { 

    const email = this.loginForm.get('email')?.value || '';
    const password = this.loginForm.get('password')?.value || '';

    this.authService.login(email, password).subscribe(
      (response) => {
        // Si la autenticación es exitosa, almacena el token y redirige
        this.authService.setToken(response.access); // Suponiendo que tengas un método para guardar el token
        this.router.navigate(['/profile']); // Cambia la ruta a la del perfil
      },
      (error) => {
        this.loggingService.error('Login error: ' + JSON.stringify(error));
        console.error(error);
        this.authenticationError = true;
      }
    );
    
        
        
}

}
