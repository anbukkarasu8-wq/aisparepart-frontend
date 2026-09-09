import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../../auth.service';
import { RecentChatService } from '../../../recent-chat.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  // ==========================================
  // FORM DATA
  // ==========================================
  email = '';
  password = '';

  // ==========================================
  // UI STATE
  // ==========================================
  error = '';
  loading = false;
  showPassword = false;
  isSignUp = false;

  private routerSub?: Subscription;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================
  constructor(
    private authService: AuthService,
    private recentChatService: RecentChatService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // LIFECYCLE
  // ==========================================
  ngOnInit(): void {
    this.updateModeFromUrl(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateModeFromUrl(event.urlAfterRedirects || event.url);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateModeFromUrl(url: string): void {
    this.isSignUp = url.includes('/register');
    this.error = '';
    this.cdr.markForCheck();
  }

  setMode(isSignUp: boolean): void {
    this.isSignUp = isSignUp;
    this.error = '';
    this.cdr.markForCheck();
  }

  // ==========================================
  // SUBMISSION HANDLER
  // ==========================================
  async onSubmit(): Promise<void> {
    await this.authenticate();
  }

  // Backwards-compatible alias for existing templates/tests
  async login(): Promise<void> {
    await this.authenticate();
  }

  // ==========================================
  // FIREBASE AUTHENTICATION (LOGIN & SIGNUP)
  // ==========================================
  private async authenticate(): Promise<void> {
    // Clear previous error
    this.error = '';

    // Basic validation
    if (!this.email.trim()) {
      this.error = 'Please enter your email address.';
      return;
    }
    if (!this.password) {
      this.error = 'Please enter your password.';
      return;
    }
    if (this.isSignUp && this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }

    // Start loading
    this.loading = true;
    this.cdr.markForCheck();

    try {
      if (this.isSignUp) {
        // Sign up via AuthService
        await this.authService.register(this.email.trim(), this.password).toPromise();
        console.log('Firebase signup successful');
      } else {
        // Login via AuthService
        await this.authService.login(this.email.trim(), this.password).toPromise();
        console.log('Firebase login successful');
      }

      // Ensure navigation executes within NgZone to guarantee view activation
      await this.ngZone.run(async () => {
        const navigated = await this.router.navigate(['/chat'], { replaceUrl: true });
        console.log('Navigation to /chat result:', navigated);
        if (!navigated) {
          await this.router.navigateByUrl('/chat');
        }
      });
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      this.ngZone.run(() => {
        switch (error?.code) {
          case 'auth/email-already-in-use':
            this.error = 'An account already exists with this email. Please sign in instead.';
            break;
          case 'auth/weak-password':
            this.error = 'Password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/invalid-email':
            this.error = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
            this.error = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            this.error = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-credential':
            this.error = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/too-many-requests':
            this.error = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/user-disabled':
            this.error = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            this.error = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            this.error = error?.message || (this.isSignUp ? 'Unable to create account. Please try again.' : 'Unable to sign in. Please check your email and password.');
            break;
        }
        this.cdr.markForCheck();
      });
    } finally {
      // Reset loading state within NgZone
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
    }
  }
}