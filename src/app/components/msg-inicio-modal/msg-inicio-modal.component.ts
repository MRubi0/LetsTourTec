import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-msg-inicio-modal',
  templateUrl: './msg-inicio-modal.component.html',
  styleUrls: ['./msg-inicio-modal.component.scss']
})
export class MsgInicioModalComponent {
  constructor(private dialogRef: MatDialogRef<MsgInicioModalComponent>) {}

  accept(): void {
    this.dialogRef.close(); // Cierra el modal
  }
}
