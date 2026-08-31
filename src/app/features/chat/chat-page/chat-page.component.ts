import {
  Component,
  OnInit,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

import {
  ChatService,
  ChatMessage,
  ChatSession
} from '../../../core/services/chat.service';


@Component({
  selector: 'app-chat-page',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './chat-page.component.html',

  styleUrl: './chat-page.component.scss'
})
export class ChatPageComponent
  implements OnInit, AfterViewChecked {


  private chatService =
    inject(ChatService);


  @ViewChild('messagesContainer')
  messagesContainer?: ElementRef;


  // SIDEBAR

  sidebarOpen = true;


  // CURRENT SESSION

  currentSessionId = '';


  // MESSAGES

  messages: ChatMessage[] = [];


  // HISTORY

  sessions: ChatSession[] = [];


  // INPUT

  messageText = '';


  // LOADING

  isLoading = false;


  // ERROR

  errorMessage = '';


  // SUGGESTIONS

  suggestions: string[] = [
    'I need brake pads for Hyundai Creta',
    'I need an oil filter',
    'I need clutch parts'
  ];


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.createOrRestoreSession();

    this.loadSessions();

    this.loadCurrentHistory();

  }


  // =====================================================
  // AFTER VIEW
  // =====================================================

  ngAfterViewChecked(): void {

    this.scrollToBottom();

  }


  // =====================================================
  // CREATE OR RESTORE SESSION
  // =====================================================

  private createOrRestoreSession(): void {

    const savedSessionId =
      localStorage.getItem(
        'ai-spare-parts-session-id'
      );


    if (savedSessionId) {

      this.currentSessionId =
        savedSessionId;

      return;

    }


    this.createFreshSession();

  }


  // =====================================================
  // CREATE NEW SESSION
  // =====================================================

  private createFreshSession(): void {

    this.currentSessionId =
      'session-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .substring(2, 8);


    localStorage.setItem(
      'ai-spare-parts-session-id',
      this.currentSessionId
    );

  }


  // =====================================================
  // SIDEBAR
  // =====================================================

  toggleSidebar(): void {

    this.sidebarOpen =
      !this.sidebarOpen;

  }


  // =====================================================
  // NEW CHAT
  // =====================================================

  newChat(): void {

    this.createFreshSession();

    this.messages = [];

    this.messageText = '';

    this.errorMessage = '';

  }


  // =====================================================
  // LOAD CHAT SESSIONS
  // =====================================================

  loadSessions(): void {

    this.chatService
      .getChatSessions()
      .subscribe({

        next: (response) => {

          if (
            response &&
            response.success
          ) {

            this.sessions =
              response.sessions || [];

          } else {

            this.sessions = [];

          }

        },

        error: (error) => {

          console.error(
            'Unable to load sessions:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD CURRENT HISTORY
  // =====================================================

  private loadCurrentHistory(): void {

    if (!this.currentSessionId) {

      return;

    }


    this.chatService
      .getChatHistory(
        this.currentSessionId
      )
      .subscribe({

        next: (response) => {

          if (
            response &&
            response.success
          ) {

            this.messages =
              response.messages || [];

          }

        },

        error: (error) => {

          console.error(
            'Unable to load history:',
            error
          );

        }

      });

  }


  // =====================================================
  // OPEN OLD CHAT
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


    this.currentSessionId =
      session.session_id;


    localStorage.setItem(
      'ai-spare-parts-session-id',
      this.currentSessionId
    );


    this.messages = [];

    this.errorMessage = '';

    this.isLoading = true;


    this.chatService
      .getChatHistory(
        session.session_id
      )
      .subscribe({

        next: (response) => {

          this.isLoading = false;


          if (
            response &&
            response.success
          ) {

            this.messages =
              response.messages || [];

          } else {

            this.errorMessage =
              'No messages found.';

          }

        },

        error: (error) => {

          this.isLoading = false;

          console.error(
            'Unable to open chat:',
            error
          );

          this.errorMessage =
            'Unable to load this conversation.';

        }

      });

  }


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  sendMessage(): void {

    const text =
      this.messageText.trim();


    if (
      !text ||
      this.isLoading
    ) {

      return;

    }


    if (!this.currentSessionId) {

      this.createFreshSession();

    }


    this.errorMessage = '';

    this.isLoading = true;


    this.chatService
      .sendMessage(
        this.currentSessionId,
        text
      )
      .subscribe({

        next: (response) => {

          this.isLoading = false;


          if (
            response &&
            response.success
          ) {

            this.messageText = '';

            this.loadCurrentHistory();

            this.loadSessions();

          } else {

            this.errorMessage =
              'Unable to get AI response.';

          }

        },

        error: (error) => {

          this.isLoading = false;

          console.error(
            'Send message error:',
            error
          );

          this.errorMessage =
            'Unable to connect to backend.';

        }

      });

  }


  // =====================================================
  // SUGGESTION
  // =====================================================

  useSuggestion(
    suggestion: string
  ): void {

    this.messageText =
      suggestion;

    this.sendMessage();

  }


  // =====================================================
  // ENTER KEY
  // =====================================================

  onEnter(
    event: Event
  ): void {

    const keyboardEvent =
      event as KeyboardEvent;


    if (
      keyboardEvent.shiftKey
    ) {

      return;

    }


    keyboardEvent.preventDefault();

    this.sendMessage();

  }


  // =====================================================
  // SESSION TITLE
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


    if (
      text.length <= 35
    ) {

      return text;

    }


    return (
      text.substring(0, 35) +
      '...'
    );

  }


  // =====================================================
  // SESSION PREVIEW
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


    if (
      text.length <= 60
    ) {

      return text;

    }


    return (
      text.substring(0, 60) +
      '...'
    );

  }


  // =====================================================
  // DELETE SESSION FROM UI
  // =====================================================

  deleteSession(
    sessionId: string
  ): void {

    this.sessions =
      this.sessions.filter(
        session =>
          session.session_id !==
          sessionId
      );


    if (
      this.currentSessionId ===
      sessionId
    ) {

      this.newChat();

    }

  }


  // =====================================================
  // CLEAR HISTORY FROM UI
  // =====================================================

  clearAllChats(): void {

    this.sessions = [];

    this.newChat();

  }


  // =====================================================
  // TRACK SESSION
  // =====================================================

  trackSession(
    index: number,
    session: ChatSession
  ): string {

    return session.session_id;

  }


  // =====================================================
  // TRACK MESSAGE
  // =====================================================

  trackMessage(
    index: number,
    message: ChatMessage
  ): number {

    return message.id;

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
  // SCROLL
  // =====================================================

  private scrollToBottom(): void {

    try {

      const element =
        this.messagesContainer
          ?.nativeElement;


      if (element) {

        element.scrollTop =
          element.scrollHeight;

      }

    } catch {

      // Ignore scroll errors

    }

  }

}