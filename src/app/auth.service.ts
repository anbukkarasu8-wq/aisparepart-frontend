import { Injectable, inject } from '@angular/core';

import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';

import { from, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ==========================================
  // FIREBASE AUTH
  // ==========================================

  private readonly auth = inject(Auth);


  // ==========================================
  // CURRENT FIREBASE USER
  // ==========================================

  readonly currentUser$: Observable<User | null> =
    user(this.auth);


  // ==========================================
  // REGISTER
  // ==========================================

  register(
    email: string,
    password: string
  ): Observable<any> {

    return from(
      createUserWithEmailAndPassword(
        this.auth,
        email.trim(),
        password
      )
    );
  }


  // ==========================================
  // LOGIN
  // ==========================================

  login(
    email: string,
    password: string
  ): Observable<any> {

    return from(
      signInWithEmailAndPassword(
        this.auth,
        email.trim(),
        password
      )
    );
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): Observable<void> {

    return from(
      signOut(this.auth)
    );
  }


  // ==========================================
  // GET CURRENT USER
  // ==========================================

  getCurrentUser(): User | null {

    return this.auth.currentUser;
  }


  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================

  isLoggedIn(): boolean {

    return this.auth.currentUser !== null;
  }


  // ==========================================
  // GET FIREBASE ID TOKEN / JWT
  // ==========================================

  async getIdToken(): Promise<string | null> {

    const currentUser =
      this.auth.currentUser;


    if (!currentUser) {

      console.warn(
        'No Firebase user is currently logged in.'
      );

      return null;
    }


    try {

      const token =
        await currentUser.getIdToken();


      console.log(
        'Firebase ID token obtained successfully.'
      );

      console.log(
        'Token length:',
        token.length
      );


      return token;

    } catch (error) {

      console.error(
        'Failed to get Firebase ID token:',
        error
      );

      return null;
    }
  }


  // ==========================================
  // FORCE REFRESH TOKEN
  // ==========================================

  async refreshIdToken(): Promise<string | null> {

    const currentUser =
      this.auth.currentUser;


    if (!currentUser) {

      return null;
    }


    try {

      const token =
        await currentUser.getIdToken(true);


      console.log(
        'Firebase ID token refreshed successfully.'
      );

      return token;

    } catch (error) {

      console.error(
        'Failed to refresh Firebase ID token:',
        error
      );

      return null;
    }
  }
}