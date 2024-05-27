import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackBarComponent } from '../components/generics/custom-snack-bar/custom-snack-bar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackService {
  constructor(
    private _snackBar: MatSnackBar,
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.openFromComponent(CustomSnackBarComponent, {
      data:{
        message:message,
        action:action, 
        snackBar:this._snackBar
      },
      duration:4000,
      panelClass:'success-snackbar'
    });
  }
}
