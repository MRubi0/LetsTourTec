import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/enviroment/enviroment';

@Component({
    selector: 'app-Signup',
    templateUrl: './Signup.component.html',
    styleUrls: ['./Signup.component.scss']
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
    }, { validators: passwordMatchValidator });

    constructor(private http: HttpClient, private router: Router) { }  


    registerUser() {
        const formData = this.loginForm.value;

        this.http.post(`${environment.apiUrl}register/`, formData).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.router.navigate(['/registration-success']);
                } else {
                    this.serverErrors = response.errors;
                    this.authenticationError = true;
                }
            },
            error: (error) => {
                console.error('Hubo un error en la petición:', error);
            },
            complete: () => {
                console.log('bien');
            }
        });
    }

    ngOnInit() {
        this.loginForm.valueChanges.subscribe((data: any) => {
        });
    }
}

export function passwordMatchValidator(g: AbstractControl) {
    const passwordControl = g.get('password1'); 
    const repeatPasswordControl = g.get('password2'); 

    if (!passwordControl || !repeatPasswordControl) {
        return null;
    }

    return passwordControl.value === repeatPasswordControl.value
        ? null : {'mismatch': true};
}
