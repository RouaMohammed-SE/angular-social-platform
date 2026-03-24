import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
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
  private readonly PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/;

  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, minimumAgeValidator(13), noFutureDateValidator]],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
      rePassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  get name(): AbstractControl {
    return this.registerForm.controls.name;
  }
  get username(): AbstractControl {
    return this.registerForm.controls.username;
  }
  get email(): AbstractControl {
    return this.registerForm.controls.email;
  }
  get gender(): AbstractControl {
    return this.registerForm.controls.gender;
  }
  get password(): AbstractControl {
    return this.registerForm.controls.password;
  }
  get dateOfBirth(): AbstractControl {
    return this.registerForm.controls.dateOfBirth;
  }

  get rePassword(): AbstractControl {
    return this.registerForm.controls.rePassword;
  }

  isInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  iconClass(control: AbstractControl | null): string {
    if (!control) return 'text-slate-400';

    if (control.invalid && (control.touched || control.dirty)) {
      return 'text-rose-500';
    }

    if (control.valid && (control.touched || control.dirty)) {
      return 'text-green-500';
    }

    return 'text-slate-400';
  }

  controlBorder(control: AbstractControl | null): string {
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

    const formData = this.registerForm.getRawValue();

    this.authService.sendRegisterData(formData).subscribe({
      next: (res) => {
        if (res.success) {
          // clear backend errors if success
          this.email.setErrors(null);
          this.username.setErrors(null);

          this.registerForm.reset();

          this.alert.success('Account Created!', 'Redirecting to login...');
          this.router.navigate(['/login']);
        }

        this.isLoading = false;
      },

      error: (err: HttpErrorResponse) => {
        const message = err.error?.message;

        if (message === 'user already exists.') {
          this.email.setErrors({
            ...this.email.errors,
            emailExists: true,
          });

          this.email.markAsTouched();
        }

        if (message === 'username already exists.') {
          this.username.setErrors({
            usernameExists: true,
          });

          this.username.markAsTouched();
        }

        this.isLoading = false;

        this.alert.error('Registration Failed', err.error?.message || 'Something went wrong');
      },
    });
  }
}
