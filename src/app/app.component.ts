import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonFooter, IonRouterOutlet, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, logOutOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, IonApp, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'AI Spare Parts';

  constructor(public authService: AuthService, public router: Router) {
    addIcons({ trashOutline, logOutOutline, addOutline });
  }

  isLoginPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register') || url === '/';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('User logged out');
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout error', err)
    });
  }

  newChat() {
    localStorage.removeItem('ai-spare-parts-session-id');
    sessionStorage.removeItem('ai-spare-parts-session-id');
    this.router.navigate(['/chat']);
  }
}