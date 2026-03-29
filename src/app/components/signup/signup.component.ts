import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/enviroment/enviroment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-Signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

    public serverErrors: any = {};
    authenticationError = false;

    loginForm = new FormGroup({
        first_name: new FormControl('', [Validators.required]),
        last_name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password1: new FormControl('', [Validators.required]),
        password2: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

    ngOnInit() {}

    registerUser() {
        const formData = this.loginForm.value;

        this.http.post(`${environment.apiUrl}register/`, formData).subscribe({
            next: (response: any) => {
                if (response.success) {
                    const email = this.loginForm.get('email')?.value || '';
                    const password = this.loginForm.get('password1')?.value || '';
                    this.authService.login(email, password).subscribe({
                        next: () => this.router.navigate(['/profile']),
                        error: () => this.router.navigate(['/login'])
                    });
                } else {
                    this.serverErrors = response.errors || {};
                    this.authenticationError = true;
                }
            },
            error: (error) => {
                if (error.error) {
                    this.serverErrors = error.error;
                }
                this.authenticationError = true;
            }
        });
    }
    passwordMatchValidator(g: AbstractControl) {
        const passwordControl = g.get('password1'); 
        const repeatPasswordControl = g.get('password2'); 
    
        if (!passwordControl || !repeatPasswordControl) {
            return null;
        }
    
        return passwordControl.value === repeatPasswordControl.value
            ? null : {'mismatch': true};
    }
}