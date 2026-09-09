import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecentChatService } from '../recent-chat.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonFab, IonFabButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, logOutOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonFab, IonFabButton],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent implements OnInit {
  sessions: any[] = []; // will hold RecentChat objects
  filteredSessions: any[] = [];
  searchTerm: string = '';
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private recentChatService: RecentChatService,
    private ngZone: NgZone
  ) {
    addIcons({ trashOutline, createOutline, logOutOutline });
  }

  ngOnInit(): void {
    this.loadRecentChats();
    this.authService.currentUser$.subscribe(u => this.user = u);
    this.sidebarService.sidebarOpen$.subscribe(); // keep alive
  }

  /** Load recent chats from local storage */
  loadRecentChats(): void {
    this.sessions = this.recentChatService.getRecentChats();
    this.applyFilter();
  }

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

  newChat(): void {
    localStorage.removeItem('ai-spare-parts-session-id');
    sessionStorage.removeItem('ai-spare-parts-session-id');
    this.router.navigate(['/chat']).then(() => {
      // force reload to create fresh session
      window.location.reload();
    });
  }

  openSession(sessionId: string): void {
    localStorage.setItem('ai-spare-parts-session-id', sessionId);
    sessionStorage.setItem('ai-spare-parts-session-id', sessionId);
    this.router.navigate(['/chat', sessionId]);
  }

  renameSession(session: any): void {
    const newTitle = window.prompt('Rename conversation', this.getTitle(session));
    if (newTitle !== null) {
      // only client side; persist title in local cache
      session.customTitle = newTitle;
      this.recentChatService.updateChatTitle(session.id, newTitle);
    }
  }

  deleteSession(sessionId: string): void {
    if (!confirm('Delete this chat session?')) return;
    // Remove from recent chats storage
    this.recentChatService.removeChat(sessionId);
    // Update local list
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.applyFilter();
  }

  getTitle(session: any): string {
    if (session.title) return session.title;
    const msg = session.lastMessage?.trim();
    if (msg) return msg.length > 35 ? msg.substring(0, 35) + '…' : msg;
    return 'New conversation';
  }

  logout(): void {
    if (!confirm('Are you sure you want to logout?')) return;
    // Sign out from Firebase
    this.authService.logout().subscribe({
      next: () => {
        this.ngZone.run(() => {
          // Clear any auth/session data
          localStorage.clear();
          sessionStorage.clear();
          // Replace current entry to prevent back navigation and redirect
          const externalLoginUrl = 'https://example.com/login';
          window.location.replace(externalLoginUrl);
        });
      },
      error: err => console.error('Logout error', err)
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
