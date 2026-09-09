import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

export const firebaseConfig = {
  apiKey: "AIzaSyB8jmUFfabdX8q9V1_OXlgeTliIfBCyfmY",
  authDomain: "sparkly-riders-studio.firebaseapp.com",
  projectId: "sparkly-riders-studio",
  storageBucket: "sparkly-riders-studio.firebasestorage.app",
  messagingSenderId: "914623682628",
  appId: "1:914623682628:web:6326c226027bae11c98411",
  measurementId: "G-8P8PEETQSZ"
};


// ==========================================
// ENSURE DEFAULT FIREBASE APP INITIALIZATION
// ==========================================

export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();


// ==========================================
// APPLICATION CONFIG
// ==========================================

export const appConfig: ApplicationConfig = {

  providers: [

    // ========================================
    // IONIC STANDALONE SUPPORT
    // ========================================

    provideIonicAngular({}),


    // ========================================
    // ANGULAR ROUTER
    // ========================================

    provideRouter(routes),


    // ========================================
    // HTTP CLIENT + AUTH INTERCEPTOR
    // ========================================

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),


    // ========================================
    // FIREBASE APP
    // ========================================

    provideFirebaseApp(() => firebaseApp),


    // ========================================
    // FIREBASE AUTHENTICATION
    // ========================================

    provideAuth(() =>
      getAuth(firebaseApp)
    ),


    // ========================================
    // FIREBASE STORAGE
    // ========================================

    provideStorage(() =>
      getStorage(firebaseApp)
    )

  ]

};
