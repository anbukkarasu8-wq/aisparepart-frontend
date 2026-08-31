import { Routes } from '@angular/router';

import { ChatPageComponent }
  from './features/chat/chat-page/chat-page.component';

import { HistoryPageComponent }
  from './features/chat/history-page/history-page.component';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },

  {
    path: 'chat',
    component: ChatPageComponent
  },

  {
    path: 'history',
    component: HistoryPageComponent
  }

];