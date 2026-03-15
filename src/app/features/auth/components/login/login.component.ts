import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AlertService } from '../../../../core/services/alert/alert.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly alert = inject(AlertService);

  isLoading = false;

  showPassword = false;

  loginForm = this.fb.nonNullable.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required],
  });

  get emailOrUsername() {
    return this.loginForm.get('emailOrUsername');
  }

  get password() {
    return this.loginForm.get('password');
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { emailOrUsername, password } = this.loginForm.getRawValue();

    const payload = emailOrUsername.includes('@')
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    this.authService.sendLoginData(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.alert.success('Welcome back!', 'Login successful');

          this.router.navigate(['/feed']);

          this.authService.setToken(res.data.token);
        }

        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
        this.alert.error('Login Failed', 'Invalid email or username or password.');
      },
    });
  }
}
