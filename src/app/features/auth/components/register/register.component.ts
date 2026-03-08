import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      username: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      dateOfBirth: new FormControl('', [
        Validators.required,
        this.minimumAgeValidator(13),
        this.noFutureDateValidator,
      ]),
      gender: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  get name() {
    return this.registerForm.get('name');
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

  noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();

    if (selectedDate > today) {
      return { futureDate: true };
    }

    return null;
  }

  minimumAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();

      return age < minAge ? { underAge: true } : null;
    };
  }

  passwordMatchValidator(form: AbstractControl): null {
    const password = form.get('password');
    const rePassword = form.get('rePassword');

    if (!password || !rePassword) return null;

    if (password.value !== rePassword.value) {
      rePassword.setErrors({
        ...rePassword.errors,
        passwordMismatch: true,
      });
    } else {
      if (rePassword.errors) {
        delete rePassword.errors['passwordMismatch'];

        if (Object.keys(rePassword.errors).length === 0) {
          rePassword.setErrors(null);
        } else {
          rePassword.setErrors(rePassword.errors);
        }
      }
    }

    return null;
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    } else {
    }
  }
}
