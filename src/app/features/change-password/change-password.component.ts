import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AlertService } from '../../core/services/alert/alert.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly alert = inject(AlertService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  private readonly passwordPattern =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  protected readonly form = this.formBuilder.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected isSubmitting = false;
  protected showCurrentPassword = false;
  protected showNewPassword = false;
  protected showConfirmPassword = false;

  protected get passwordsMismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    return !!confirmPassword && newPassword !== confirmPassword;
  }

  protected get passwordChecks() {
    const value = this.form.controls.newPassword.value;

    return {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[#?!@$%^&*-]/.test(value),
    };
  }

  protected get currentPasswordControl(): AbstractControl<string, string> {
    return this.form.controls.currentPassword;
  }

  protected get newPasswordControl(): AbstractControl<string, string> {
    return this.form.controls.newPassword;
  }

  protected get confirmPasswordControl(): AbstractControl<string, string> {
    return this.form.controls.confirmPassword;
  }

  protected isInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  protected iconClass(control: AbstractControl | null): string {
    if (!control) {
      return 'text-slate-400';
    }

    if (control.invalid && (control.touched || control.dirty)) {
      return 'text-rose-500';
    }

    if (control.valid && (control.touched || control.dirty)) {
      return 'text-green-500';
    }

    return 'text-slate-400';
  }

  protected controlBorder(control: AbstractControl | null): string {
    if (!control) {
      return 'border-slate-300';
    }

    if (control.invalid && (control.touched || control.dirty)) {
      return 'border-rose-500';
    }

    if (control.valid && (control.touched || control.dirty)) {
      return 'border-green-500';
    }

    return 'border-slate-300';
  }

  protected submit(): void {
    if (this.form.invalid || this.passwordsMismatch || this.isSubmitting) {
      this.form.markAllAsTouched();

      if (this.passwordsMismatch) {
        this.alert.warning('Password mismatch', 'Please make sure the new passwords match.');
      }

      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService.changePassword({
      password: currentPassword,
      newPassword,
    })
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: (response) => {
          this.authService.setToken(response.data.token);
          this.form.reset();
          this.alert.success('Password updated', 'Your password was changed successfully.');
        },
        error: (error) => {
          const message = error.error?.message ?? 'We could not update your password right now.';
          this.alert.error('Update failed', message);
        },
      });
  }

  protected showError(controlName: 'currentPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected hasControlError(
    controlName: 'currentPassword' | 'newPassword' | 'confirmPassword',
    errorKey: string,
  ): boolean {
    const control = this.form.controls[controlName];
    return !!(control.errors?.[errorKey] && (control.dirty || control.touched));
  }

  protected toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  protected toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
