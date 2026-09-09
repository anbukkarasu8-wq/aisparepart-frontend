import { Injectable } from '@angular/core';

export interface RecentChat {
  id: string;
  title: string;
  createdAt: string; // ISO string
  lastMessage?: string;
}

const STORAGE_KEY = 'recent_chats';

@Injectable({
  providedIn: 'root'
})
export class RecentChatService {
  /** Get all saved recent chats, ordered by most recent */
  getRecentChats(): RecentChat[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as RecentChat[];
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Failed to parse recent chats', e);
      return [];
    }
  }

  /** Add or update a recent chat entry */
  upsertChat(chat: RecentChat): void {
    const chats = this.getRecentChats().filter(c => c.id !== chat.id);
    chats.unshift(chat);
    const limited = chats.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  }

  /** Remove a chat from history */
  removeChat(id: string): void {
    const chats = this.getRecentChats().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }

  /** Clear all recent chats */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Update the title of a chat entry */
  updateChatTitle(id: string, title: string): void {
    const chats = this.getRecentChats();
    const idx = chats.findIndex(c => c.id === id);
    if (idx !== -1) {
      chats[idx].title = title;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }
}
