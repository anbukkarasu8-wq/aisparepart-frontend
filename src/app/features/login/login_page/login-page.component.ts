import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './login-page.component.html',

  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

  private router = inject(Router);


  /*
   * Login form
   */

  loginForm = new FormGroup({

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    })

  });


  /*
   * Show / hide password
   */

  showPassword = false;


  /*
   * Login error
   */

  loginError = '';


  /*
   * Loading state
   */

  isLoading = false;


  /*
   * Login function
   */

  login(): void {

    this.loginError = '';


    /*
     * Check form validation
     */

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }


    this.isLoading = true;


    const email =
      this.loginForm.controls.email.value;

    const password =
      this.loginForm.controls.password.value;


    /*
     * MOCK LOGIN
     *
     * For Day 1 we are not using a real
     * backend or database.
     *
     * Demo credentials:
     *
     * Email: user@example.com
     * Password: 123456
     */

    setTimeout(() => {

      if (
        email === 'user@example.com' &&
        password === '123456'
      ) {

        /*
         * Save login status
         */

        localStorage.setItem(
          'isLoggedIn',
          'true'
        );


        /*
         * Go to chatbot
         */

        this.router.navigate(['/chat']);

      } else {

        this.loginError =
          'Invalid email or password.';

      }


      this.isLoading = false;

    }, 500);

  }


  /*
   * Toggle password visibility
   */

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  /*
   * Demo login
   */

  useDemoLogin(): void {

    this.loginForm.setValue({

      email: 'user@example.com',

      password: '123456'

    });

  }

}