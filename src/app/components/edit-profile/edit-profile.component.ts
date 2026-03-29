import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { SnackService } from 'src/app/services/snack.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  profileForm: FormGroup;
  imageSrc: string | ArrayBuffer | null = null;
  currentAvatar: string | null = null;
  fileName: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackService: SnackService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      bio: [''],
      profileImage: [null]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const decoded: any = jwtDecode(token);
    this.profileService.getProfile(decoded.user_id).subscribe({
      next: (res: any) => {
        const u = res.user;
        this.profileForm.patchValue({
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          email: u.email || '',
          bio: u.bio || ''
        });
        this.currentAvatar = u.avatar || null;
        this.profileForm.markAsPristine();
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.fileName = file.name;
      this.profileForm.patchValue({ profileImage: file });
      const reader = new FileReader();
      reader.onload = (e: any) => { this.imageSrc = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    const formData = new FormData();
    let cambios = false;

    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control && control.dirty && key !== 'profileImage') {
        formData.append(key, control.value);
        cambios = true;
      }
    });

    if (this.fileName) {
      formData.append('profileImage', this.profileForm.value.profileImage, this.fileName);
      cambios = true;
    }

    if (!cambios) {
      this.snackService.openSnackBar('No hay cambios que guardar', 'OK');
      return;
    }

    this.loading = true;
    this.profileService.updateUserProfile(formData).subscribe({
      next: () => {
        this.loading = false;
        this.snackService.openSnackBar('Perfil actualizado correctamente', 'OK');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.loading = false;
        this.snackService.openSnackBar('Error al actualizar el perfil', 'OK');
      }
    });
  }
}
