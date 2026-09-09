import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';

import {
  from,
  switchMap,
  catchError,
  throwError,
  take,
  timeout,
  of
} from 'rxjs';

import { API_BASE_URL } from './api-config';


export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  // =====================================================
  // FIREBASE AUTH
  // =====================================================

  const auth = inject(Auth);


  // =====================================================
  // ONLY INTERCEPT OUR BACKEND REQUESTS
  // =====================================================

  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }


  // =====================================================
  // GET CURRENT USER (immediate or wait for authState)
  // =====================================================

  const user$ = auth.currentUser
    ? of(auth.currentUser)
    : authState(auth).pipe(
        take(1),
        timeout(2000),
        catchError(() => of(auth.currentUser))
      );

  return user$.pipe(
    switchMap((currentUser) => {

      // ===================================================
      // USER NOT LOGGED IN
      // ===================================================

      if (!currentUser) {

        console.warn(
          'AUTH INTERCEPTOR: No Firebase user. Sending request without token.'
        );

        // Send without token — let backend return 401
        return next(req);
      }


      // ===================================================
      // GET VALID FIREBASE ID TOKEN
      // ===================================================

      return from(
        currentUser.getIdToken()
      ).pipe(

        switchMap((token) => {

          if (!token) {
            return next(req);
          }

          // ===============================================
          // CREATE AUTHORIZED REQUEST
          // ===============================================

          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              // 'ngrok-skip-browser-warning': 'true'
            }
          });

          return next(authReq);

        }),


        // ===============================================
        // FIREBASE TOKEN ERROR
        // ===============================================

        catchError((error) => {

          console.error(
            'AUTH INTERCEPTOR: Firebase token error',
            error
          );

          return throwError(
            () => error
          );

        })

      );

    })

  );
};
