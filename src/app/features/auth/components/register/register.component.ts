import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  minimumAgeValidator,
  noFutureDateValidator,
  passwordMatchValidator,
} from '../../../../shared/validators/auth.validators';
import { AlertService } from '../../../../core/services/alert/alert.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly alert = inject(AlertService);

  isLoading: boolean = false;

  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, minimumAgeValidator(13), noFutureDateValidator]],
      gender: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      rePassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  get name() {
    return this.registerForm.get('name');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get gender() {
    return this.registerForm.get('gender');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth');
  }

  get rePassword() {
    return this.registerForm.get('rePassword');
  }

  isInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  iconClass(control: AbstractControl | null) {
    if (!control) return 'text-slate-400';

    if (control.invalid && (control.touched || control.dirty)) {
      return 'text-rose-500';
    }

    if (control.valid && (control.touched || control.dirty)) {
      return 'text-green-500';
    }

    return 'text-slate-400';
  }

  controlBorder(control: AbstractControl | null) {
    if (!control) return 'border-slate-300 ';

    if (control.invalid && (control.touched || control.dirty)) {
      return 'border-rose-500 ';
    }

    if (control.valid && (control.touched || control.dirty)) {
      return 'border-green-500 ';
    }

    return 'border-slate-300 ';
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = this.registerForm.value;

    this.authService.sendRegisterData(formData).subscribe({
      next: (res) => {
        if (res.success === true) {
          // clear backend errors if success
          this.email?.setErrors(null);
          this.registerForm.get('username')?.setErrors(null);

          this.registerForm.reset();
          this.registerForm.markAsPristine();
          this.registerForm.markAsUntouched();

          this.alert
            .success('Account Created!', 'Redirecting to login...')
            .then(() => this.router.navigate(['/login']));
        }

        this.isLoading = false;
      },

      error: (err: HttpErrorResponse) => {
        const message = err.error?.message;

        if (message === 'user already exists.') {
          this.email?.setErrors({
            ...this.email?.errors,
            emailExists: true,
          });

          this.email?.markAsTouched();
        }

        if (message === 'username already exists.') {
          this.registerForm.get('username')?.setErrors({
            usernameExists: true,
          });

          this.registerForm.get('username')?.markAsTouched();
        }

        this.isLoading = false;

        this.alert.error('Registration Failed', err.error?.message || 'Something went wrong');
      },
    });
  }
}
