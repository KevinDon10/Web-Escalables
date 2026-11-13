import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../service/user-service';
import type { NewUser } from '../../interfaces/user.interface';

@Component({
  selector: 'app-create-user-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create-user-page.html',
  styleUrl: './create-user-page.css',
})
export class CreateUserPage {
  private userService = inject(UserService);
  private router = inject(Router);
  public isSubmitting = false;
  public submitError = '';

  userForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    image: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const newUser: NewUser = {
      name: this.userForm.controls.name.value,
      username: this.userForm.controls.username.value,
      email: this.userForm.controls.email.value,
      image: this.userForm.controls.image.value,
    };

    this.isSubmitting = true;
    this.submitError = '';

    this.userService.addUser(newUser).subscribe({
      next: () => {
        this.userService.search('');
        this.userForm.reset();
        void this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error al crear el usuario', error);
        this.submitError = 'No se pudo guardar el usuario. Revisa los datos e inténtalo de nuevo.';
        this.isSubmitting = false;
      },
    });
  }
}