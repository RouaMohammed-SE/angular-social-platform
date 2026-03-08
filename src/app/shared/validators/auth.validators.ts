import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const selectedDate = new Date(control.value);
  const today = new Date();

  return selectedDate > today ? { futureDate: true } : null;
}

export function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < minAge ? { underAge: true } : null;
  };
}

export function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
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
