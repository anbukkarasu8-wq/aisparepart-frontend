import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import {
  ChatService,
  ChatSession,
  ChatMessage
} from '../../../core/services/chat.service';


@Component({
  selector: 'app-history-page',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './history-page.component.html',

  styleUrl: './history-page.component.scss'
})


export class HistoryPageComponent
  implements OnInit {


  // =====================================================
  // CHAT SERVICE
  // =====================================================

  private chatService =
    inject(ChatService);


  // =====================================================
  // USER
  // =====================================================




  // =====================================================
  // ALL CHAT SESSIONS
  // =====================================================

  sessions: ChatSession[] = [];


  // =====================================================
  // SELECTED SESSION
  // =====================================================

  selectedSession:
    ChatSession | null = null;


  // =====================================================
  // MESSAGES
  // =====================================================

  messages: ChatMessage[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;

  loadingMessages = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // PAGE INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadHistory();

  }


  // =====================================================
  // GET ALL CHAT SESSIONS
  // =====================================================

  loadHistory(): void {

    this.loading = true;

    this.errorMessage = '';


      this.chatService
      .getChatSessions()
      .subscribe({
        next: (response) => {

          this.loading = false;


          if (response) {

            this.sessions =
              response.data || [];


            if (
              this.sessions.length === 0
            ) {

              this.errorMessage =
                'No chat history found.';

            }

          } else {

            this.sessions = [];

            this.errorMessage =
              'No chat history found.';

          }

        },


        error: (error) => {

          this.loading = false;

          console.error(
            'Failed to load chat sessions:',
            error
          );

          this.sessions = [];

          this.errorMessage =
            'Unable to connect to the backend.';

        }

      });

  }


  // =====================================================
  // OPEN CHAT
  // =====================================================

  openSession(
    session: ChatSession
  ): void {

    if (
      !session ||
      !session.session_id
    ) {

      return;

    }


    this.selectedSession =
      session;

    this.messages = [];

    this.errorMessage = '';

    this.loadingMessages = true;


    this.chatService
      .getChatHistory(
        session.session_id
      )
      .subscribe({

        next: (response) => {

          this.loadingMessages = false;


          if (response) {

            this.messages =
              response.data || [];


            if (
              this.messages.length === 0
            ) {

              this.errorMessage =
                'No messages found for this chat.';

            }

          } else {

            this.messages = [];

            this.errorMessage =
              'No messages found for this chat.';

          }

        },


        error: (error) => {

          this.loadingMessages = false;

          console.error(
            'Failed to load messages:',
            error
          );

          this.messages = [];

          this.errorMessage =
            'Unable to load this conversation.';

        }

      });

  }


  // =====================================================
  // CHAT TITLE
  // =====================================================

  getSessionTitle(
    session: ChatSession
  ): string {

    if (
      !session ||
      !session.last_message
    ) {

      return 'New conversation';

    }


    const text =
      session.last_message.trim();


    if (!text) {

      return 'New conversation';

    }


    if (text.length <= 40) {

      return text;

    }


    return (
      text.substring(0, 40) +
      '...'
    );

  }


  // =====================================================
  // CHAT PREVIEW
  // =====================================================

  getSessionPreview(
    session: ChatSession
  ): string {

    if (
      !session ||
      !session.last_message
    ) {

      return 'No messages';

    }


    const text =
      session.last_message.trim();


    if (text.length <= 70) {

      return text;

    }


    return (
      text.substring(0, 70) +
      '...'
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '';

    }


    const parsedDate =
      new Date(date);


    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {

      return '';

    }


    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  // =====================================================
  // FORMAT TIME
  // =====================================================

  formatTime(
    date?: string
  ): string {

    if (!date) {

      return '';

    }


    const parsedDate =
      new Date(date);


    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {

      return '';

    }


    return parsedDate.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  // =====================================================
  // CLOSE CHAT
  // =====================================================

  closeConversation(): void {

    this.selectedSession = null;

    this.messages = [];

    this.errorMessage = '';

  }


  // =====================================================
  // REFRESH HISTORY
  // =====================================================

  refresh(): void {

    this.selectedSession = null;

    this.messages = [];

    this.loadHistory();

  }

}