import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SnackService } from 'src/app/services/snack.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private snackService: SnackService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data.users || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleActive(user: any): void {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (res: any) => {
        user.is_active = res.is_active;
        this.snackService.openSnackBar(res.message, 'OK');
      },
      error: (err: any) => {
        this.snackService.openSnackBar(err?.error?.error || 'Error al cambiar estado', 'OK');
      }
    });
  }
}
