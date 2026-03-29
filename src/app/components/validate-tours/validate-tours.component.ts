import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { SnackService } from 'src/app/services/snack.service';
import { ValidateDialogComponent } from '../generics/validate-dialog/validate-dialog.component';

@Component({
  selector: 'app-validate-tours',
  templateUrl: './validate-tours.component.html',
  styleUrls: ['./validate-tours.component.scss']
})
export class ValidateToursComponent implements OnInit {
  tours: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private snackService: SnackService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    const lang = localStorage.getItem('language') ?? 'es';
    this.adminService.getPendingTours(lang).subscribe({
      next: (data: any) => {
        this.tours = data.tours || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openValidateDialog(tour: any): void {
    const ref = this.dialog.open(ValidateDialogComponent, {
      data: { tour },
      panelClass: 'ltt-dialog-panel'
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;
      const approve = result.action === 'approve';
      const obs = approve
        ? this.adminService.approveTour(tour.id)
        : this.adminService.rejectTour(tour.id, result.reason);

      obs.subscribe({
        next: () => {
          this.snackService.openSnackBar(approve ? 'Tour publicado correctamente' : 'Tour rechazado', 'OK');
          this.loadTours();
        },
        error: (err: any) => {
          this.snackService.openSnackBar(err?.error?.error || 'Error al procesar el tour', 'OK');
        }
      });
    });
  }
}
