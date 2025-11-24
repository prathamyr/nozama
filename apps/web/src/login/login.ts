import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

// Causes errors when email format is malformed
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  imports: [Navbar, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login {
  // Checks whether the login fields are empty
  firstNameFormControl = new FormControl('', Validators.required);
  lastNameFormControl = new FormControl('', Validators.required);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', Validators.required);

  matcher = new MyErrorStateMatcher();

  state: String = "Log In";

  changeState() {
    if (this.state === "Log In") {
      this.state = "Sign Up";
    } else {
      this.state = "Log In";
    }
  }
  checkError() {
    if (this.state === "Log In") {
      // Only check email and password for login
      return this.emailFormControl.hasError('required') || this.emailFormControl.hasError('email') || this.passwordFormControl.hasError('required');
    } else {
      // Check all fields for sign up
      return this.firstNameFormControl.hasError('required') || this.lastNameFormControl.hasError('required') || this.emailFormControl.hasError('required') || this.emailFormControl.hasError('email') || this.passwordFormControl.hasError('required');
    }
  }
}
