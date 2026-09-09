import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Directly check if a user is authenticated
  if (auth.currentUser) {
    return true;
  }
  // Not authenticated, redirect to login page
  return router.createUrlTree(['/login']);
};