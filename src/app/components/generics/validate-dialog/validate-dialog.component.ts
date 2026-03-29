import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ValidateDialogData {
  tour: any;
}

export interface ValidateDialogResult {
  action: 'approve' | 'reject';
  reason?: string;
}

@Component({
  selector: 'app-validate-dialog',
  templateUrl: './validate-dialog.component.html',
  styleUrls: ['./validate-dialog.component.scss']
})
export class ValidateDialogComponent {
  showRejectForm = false;
  rejectReason = '';

  constructor(
    public dialogRef: MatDialogRef<ValidateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ValidateDialogData
  ) {}

  approve(): void {
    this.dialogRef.close({ action: 'approve' });
  }

  reject(): void {
    if (!this.showRejectForm) {
      this.showRejectForm = true;
      return;
    }
    this.dialogRef.close({ action: 'reject', reason: this.rejectReason });
  }
}
