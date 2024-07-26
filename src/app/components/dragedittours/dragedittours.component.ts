import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dragedittours',
  templateUrl: './dragedittours.component.html',
  styleUrls: ['./dragedittours.component.scss'],
})
export class DragedittoursComponent {
  @Input('form') form!: any;
  form_to_send:any;

  constructor(
    public dialogRef: MatDialogRef<DragedittoursComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = data.form;
  }

  ngOnInit() {
    this.form_to_send = this.form.map((data: any) => {
      const type = typeof data.image;
      if (type !== 'string') {
        const blob = new Blob([data.image], { type: data.image.type });
        data.image = URL.createObjectURL(blob);
      }
      return data;
    });
  }

  drop(event: any) {
    moveItemInArray(this.form, event.previousIndex, event.currentIndex);
    this.form = this.form.map((data: any, index: number) => {
      data.stepNumber = index + 1;
      return data;
    });
  }

  trackByMovie(index: number, movie: string): number {
    return index;    
  }

  save() {
    this.dialogRef.close(this.form_to_send);
  }
}
