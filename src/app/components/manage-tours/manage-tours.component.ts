import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { SnackService } from 'src/app/services/snack.service';
import { ConfirmDialogComponent } from '../generics/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-tours',
  templateUrl: './manage-tours.component.html',
  styleUrls: ['./manage-tours.component.scss']
})
export class ManageToursComponent implements OnInit {
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
    this.adminService.getPublishedTours(lang).subscribe({
      next: (data: any) => {
        this.tours = data.tours || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  unpublish(tour: any): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { message: `¿Despublicar "${tour.titulo}"? Dejará de ser visible para los usuarios.` }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminService.unpublishTour(tour.id).subscribe({
        next: () => {
          this.snackService.openSnackBar('Tour despublicado', 'OK');
          this.loadTours();
        },
        error: () => this.snackService.openSnackBar('Error al despublicar', 'OK')
      });
    });
  }

  delete(tour: any): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { message: `¿Eliminar permanentemente "${tour.titulo}"? Esta acción no se puede deshacer.` }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.adminService.deleteTour(tour.id).subscribe({
        next: () => {
          this.snackService.openSnackBar('Tour eliminado', 'OK');
          this.loadTours();
        },
        error: () => this.snackService.openSnackBar('Error al eliminar', 'OK')
      });
    });
  }
}
