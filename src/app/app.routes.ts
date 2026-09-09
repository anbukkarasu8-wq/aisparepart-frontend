import { Routes } from '@angular/router';

import { ChatPageComponent }
  from './features/chat/chat-page/chat-page.component';

import { HistoryPageComponent }
  from './features/chat/history-page/history-page.component';

import { authGuard } from './auth.guard';
import { LoginComponent } from './features/login/login_page/login-page.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'chat',
    component: ChatPageComponent,
    canActivate: [authGuard]
  },

  {
    path: 'chat/:sessionId',
    component: ChatPageComponent,
    canActivate: [authGuard]
  },

  {
    path: 'history',
    component: HistoryPageComponent,
    canActivate: [authGuard]
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: LoginComponent
  },

  {
    path: 'image-upload',
    component: ImageUploadComponent,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];