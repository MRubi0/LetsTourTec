import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  profileForm: FormGroup; 
  imageSrc: string | ArrayBuffer | null = null; 
  fileName: string = '';

  constructor(private fb: FormBuilder, private profileService: ProfileService) { 
    this.profileForm = this.fb.group({
      firstName: [''], // Validators.required removido para permitir actualizaciones parciales
      lastName: [''], // Lo mismo aquí
      email: ['', [Validators.email]], // Si el email puede cambiarse, asegúrate de validar el formato correctamente
      bio: [''],
      profileImage: [null]
    });
    
  }

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.fileName = file.name;
  
      // Actualiza el formulario reactivo con el archivo
      this.profileForm.patchValue({
        profileImage: file
      });
  
      // Lee y muestra la vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    const formData = new FormData();
  
    // Marca si se detectaron cambios en el formulario
    let cambiosDetectados = false;
  
    // Agrega solo los campos que han sido modificados al formData
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
  
      // Considera solo los controles que han sido cambiados
      if (control && control.dirty) {
        formData.append(key, control.value);
        cambiosDetectados = true; // Marca que se han detectado cambios
      }
    });
  
    // Maneja la imagen de perfil por separado, ya que no se une directamente al formulario reactivo
    if (this.fileName) {
      formData.append('profileImage', this.profileForm.value.profileImage, this.fileName);
      cambiosDetectados = true; // Marca que se han detectado cambios
    }
  
    if (cambiosDetectados) {
      this.profileService.updateUserProfile(formData).subscribe({
        next: (response: any) => {
          console.log('Perfil actualizado con éxito', response);
          // Aquí podrías redirigir al usuario o mostrar una notificación de éxito
        },
        error: (error: any) => {
          console.error('Error al actualizar el perfil', error);
          // Mostrar una notificación de error
        }
      });
    } else {
      console.log('No hay cambios para actualizar');
      // Mostrar una notificación o acción relevante cuando no hay cambios
    }
  }
  

}