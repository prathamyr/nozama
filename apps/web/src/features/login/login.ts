import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  // Toggle between "Log In" and "Sign Up"
  state: string = "Log In";
  
  // Form fields
  firstname: string = "";
  lastname: string = "";
  email: string = "";
  password: string = "";
  
  // Error message
  errorMessage: string = "";
  
  // Loading state
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  // Toggle between login and signup
  changeState() {
    this.state = this.state === "Log In" ? "Sign Up" : "Log In";
    this.errorMessage = "";
    
    // Reset form fields
    this.firstname = "";
    this.lastname = "";
    this.email = "";
    this.password = "";
  }

  // Validate form fields
  isFormValid(): boolean {
    if (this.state === "Log In") {
      // Only email and password required for login
      return this.email.trim() !== "" && this.password.trim() !== "";
    } else {
      // All fields required for signup
      return (
        this.firstname.trim() !== "" &&
        this.lastname.trim() !== "" &&
        this.email.trim() !== "" &&
        this.password.trim() !== ""
      );
    }
  }

  // Handle form submission
  handleSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = "Please fill in all required fields.";
      return;
    }

    if (this.state === "Log In") {
      this.login();
    } else {
      this.signup();
    }
  }

  // Login user
  login() {
    this.isLoading = true;
    this.errorMessage = "";

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.ok && response.user) {
          // Save user to localStorage
          this.authService.setCurrentUser(response.user);
          
          // Load cart (OLD)
          // if (response.cart) {
          //   this.cartService.getCart(response.user._id).subscribe();
          // }
          
          // Load cart:
          if (response.cart) {
            this.cartService.setCart(response.cart);
          }

          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          this.errorMessage = response.error || "Login failed. Please try again.";
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.error || "Invalid email or password.";
        this.isLoading = false;
      }
    });
  }

  // Signup new user
  signup() {
    this.isLoading = true;
    this.errorMessage = "";

    const signupData = {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        if (response.ok && response.user) {
          // Save user to localStorage
          this.authService.setCurrentUser(response.user);
          
          //load cart
          if (response.cart) {
            this.cartService.setCart(response.cart);
          }
          
          // Redirect based on role
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          this.errorMessage = response.error || "Signup failed. Please try again.";
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Signup error:', err);
        this.errorMessage = err.error?.error || "Signup failed. Please try again.";
        this.isLoading = false;
      }
    });
  }
}