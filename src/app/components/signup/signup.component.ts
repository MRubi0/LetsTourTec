
// import { Component } from '@angular/core';
// import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';


// function passwordMatchValidator(g: AbstractControl) {
//   const passwordControl = g.get('password');
//   const repeatPasswordControl = g.get('repeatPassword');

//   if (!passwordControl || !repeatPasswordControl) {
//       return null;
//   }

//   return passwordControl.value === repeatPasswordControl.value
//       ? null : {'mismatch': true};
// }

// @Component({
//   selector: 'app-Signup',
//   templateUrl: './Signup.component.html',
//   styleUrls: ['./Signup.component.scss']
// })
// export class SignupComponent {

//   public serverErrors: any = {};


//   authenticationError = false;

//   loginForm = new FormGroup({
//     firstName: new FormControl('', [Validators.required]),
//     lastName: new FormControl('', [Validators.required]),
//     email: new FormControl('', [Validators.required, Validators.email]),
//     password: new FormControl('', [Validators.required]),
//     repeatPassword: new FormControl('', [Validators.required])}
//     , { validators: passwordMatchValidator });

//   constructor(private http: HttpClient) {}

//   registerUser() {
//     const formData = this.loginForm.value;
  
//     this.http.post('http://localhost:8000/register/', formData).subscribe({
//       next: (response: any) => {
//         if (response.success) {
//           console.log("Success");
//         } else {
//           this.serverErrors = response.errors;
//           this.authenticationError = true;
//         }
//       },
//       error: (error) => {
//         console.error('Hubo un error en la petición:', error);
//       },
//       complete: () => {
//         console.log('bien');
//       }
//     });
//   }

//   ngOnInit(){
//     this.loginForm.valueChanges.subscribe((data:any)=>{
//       console.log('data --->', data);
//     });
//   }
// }

import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

function passwordMatchValidator(g: AbstractControl) {
    const passwordControl = g.get('password1'); // Ajustado a "password1"
    const repeatPasswordControl = g.get('password2'); // Ajustado a "password2"

    if (!passwordControl || !repeatPasswordControl) {
        return null;
    }

    return passwordControl.value === repeatPasswordControl.value
        ? null : {'mismatch': true};
}

@Component({
    selector: 'app-Signup',
    templateUrl: './Signup.component.html',
    styleUrls: ['./Signup.component.scss']
})
export class SignupComponent {

    public serverErrors: any = {};

    authenticationError = false;

    loginForm = new FormGroup({
        first_name: new FormControl('', [Validators.required]), // Ajustado a "first_name"
        last_name: new FormControl('', [Validators.required]),  // Ajustado a "last_name"
        email: new FormControl('', [Validators.required, Validators.email]),
        password1: new FormControl('', [Validators.required]),  // Ajustado a "password1"
        password2: new FormControl('', [Validators.required])  // Ajustado a "password2"
    }, { validators: passwordMatchValidator });

    constructor(private http: HttpClient) { }

    registerUser() {
        const formData = this.loginForm.value;

        this.http.post('http://localhost:8000/register/', formData).subscribe({
            next: (response: any) => {
                if (response.success) {
                    console.log("Success");
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
            console.log('data --->', data);
        });
    }
}
