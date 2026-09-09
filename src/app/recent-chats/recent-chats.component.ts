import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatSessionsService } from '../chat-sessions.service';
import { IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner, IonButtons } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

interface ChatSession {
  id: string;
  created_at: string; // ISO string
}

@Component({
  selector: 'app-recent-chats',
  standalone: true,
  imports: [CommonModule, FormsModule, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner, IonButtons],
  templateUrl: './recent-chats.component.html',
  styleUrls: ['./recent-chats.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecentChatsComponent implements OnInit {
  sessions: ChatSession[] = [];
  filteredSessions: ChatSession[] = [];
  loading = false;
  errorMessage = '';
  searchTerm: string = '';

  constructor(private chatService: ChatSessionsService, private router: Router) {
    addIcons({ trashOutline });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.chatService.getSessions().subscribe({
      next: (data: any) => {
        // Preserve full session object to allow searching by last_message
        this.sessions = data?.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load chat sessions';
        console.error(err);
        this.loading = false;
      }
    });
  }

  openSession(sessionId: string): void {
    localStorage.setItem('ai-spare-parts-session-id', sessionId);
    sessionStorage.setItem('ai-spare-parts-session-id', sessionId);
    this.router.navigate(['/chat', sessionId]).then(() => {
      window.location.href = `/chat/${sessionId}`;
    });
  }

  /**
   * Apply filter based on searchTerm matching the last_message of each session.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredSessions = this.sessions;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredSessions = this.sessions.filter(s =>
      (s.last_message || '').toLowerCase().includes(term)
    );
  }

  deleteSession(sessionId: string): void {
    if (!confirm('Delete this chat session?')) return;
    this.chatService.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Could not delete session');
      }
    });
  }

  newChat(): void {
    localStorage.removeItem('ai-spare-parts-session-id');
    sessionStorage.removeItem('ai-spare-parts-session-id');
    this.router.navigate(['/chat']).then(() => {
      window.location.href = '/chat';
    });
  }
}
