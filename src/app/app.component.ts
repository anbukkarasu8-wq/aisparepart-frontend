import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ChatService } from './core/services/chat.service';


interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
}


@Component({
  selector: 'app-root',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './app.component.html',

  styleUrl: './app.component.scss'
})


export class AppComponent {

  title = 'AI Spare Parts';

  message = '';

  loading = false;

  sessionId = 'demo-session-001';

  messages: ChatMessage[] = [];


  constructor(
    private chatService: ChatService
  ) {}


  sendMessage(): void {

    const text = this.message.trim();

    if (!text) {
      return;
    }


    // Add user's message to the screen
    this.messages.push({
      role: 'user',
      message: text
    });


    // Clear input box
    this.message = '';

    // Show loading
    this.loading = true;


    // Send message to Python backend
    this.chatService
      .sendMessage(this.sessionId, text)
      .subscribe({

        next: (response) => {

          console.log(
            'Backend response:',
            response
          );


          // Add chatbot response
          this.messages.push({
            role: 'assistant',
            message: response.response
          });


          this.loading = false;
        },


        error: (error: HttpErrorResponse) => {

          console.error(
            'Chat API Error:',
            error
          );


          this.messages.push({
            role: 'assistant',
            message:
              'Sorry, something went wrong. Please try again.'
          });


          this.loading = false;
        }

      });

  }


  sendOnEnter(event: Event): void {

    const keyboardEvent =
      event as KeyboardEvent;


    if (
      keyboardEvent.key === 'Enter' &&
      !keyboardEvent.shiftKey
    ) {

      keyboardEvent.preventDefault();

      this.sendMessage();
    }

  }

}