import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss'
})
export class ChatPageComponent {

  message = '';
  loading = false;
  sessionId = '';
  messages: ChatMessage[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {
    this.createNewSession();
  }

  createNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.messages = [];
    this.message = '';
    this.loading = false;
  }

  private generateSessionId(): string {
    return (
      'session-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 10)
    );
  }

  sendMessage(): void {
    const text = this.message.trim();

    if (!text) {
      return;
    }

    this.messages.push({ role: 'user', message: text });
    this.message = '';
    this.loading = true;

    this.chatService
      .sendMessage(this.sessionId, text)
      .subscribe({
        next: (response: any) => {
          this.messages.push({
            role: 'assistant',
            message: response.response || 'Sorry, I did not understand that.'
          });
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chat API Error:', error);
          this.messages.push({
            role: 'assistant',
            message: 'Sorry, something went wrong. Please try again.'
          });
          this.loading = false;
        }
      });
  }

  sendOnEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  newChat(): void {
    this.createNewSession();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}