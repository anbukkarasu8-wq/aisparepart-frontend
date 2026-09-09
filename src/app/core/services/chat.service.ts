import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../api-config';


// =====================================================
// CHAT MESSAGE
// =====================================================

export interface ChatMessage {

  id: number;

  session_id: string;

  role: 'user' | 'assistant';

  message: string;

  image_url?: string | null;

  created_at?: string;

}


// =====================================================
// CHAT RESPONSE
// =====================================================

export interface ChatResponse {

  message: string;

  session_id: string;

  user_id: number;

  answer?: string;

  response?: string;

  image_url?: string | null;

}


// =====================================================
// CHAT HISTORY RESPONSE
// =====================================================

export interface ChatHistoryResponse {

  message: string;

  session_id: string;

  data: ChatMessage[];

}


// =====================================================
// CHAT SESSION
// =====================================================

export interface ChatSession {

  session_id: string;

  user_id: number;

  title: string | null;

  last_message: string | null;

  created_at?: string;

  updated_at?: string;

}


// =====================================================
// CHAT SESSIONS RESPONSE
// =====================================================

export interface ChatSessionsResponse {

  message: string;

  user_id: number;

  data: ChatSession[];

}


// =====================================================
// SEARCH HISTORY
// =====================================================

export interface SearchHistory {

  id: number;

  user_id: number;

  message: string;

  created_at?: string;

}


// =====================================================
// SEARCH HISTORY RESPONSE
// =====================================================

export interface SearchHistoryResponse {

  message: string;

  user_id: number;

  data: SearchHistory[];

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ChatService {


  // ===================================================
  // BACKEND URL
  // ===================================================

  private readonly apiUrl = API_BASE_URL;


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // SEND MESSAGE
  // ===================================================

  sendMessage(
    sessionId: string,
    message: string,
    imageUrl?: string | null
  ): Observable<ChatResponse> {

    const payload: {
      session_id: string;
      message: string;
      image_url?: string;
    } = {
      session_id: sessionId,
      message: message
    };


    if (imageUrl) {

      payload.image_url = imageUrl;

    }


    console.log(
      'CHAT SERVICE: Sending message'
    );

    console.log(
      'CHAT SERVICE URL:',
      `${this.apiUrl}/chat`
    );


    return this.http.post<ChatResponse>(

      `${this.apiUrl}/chat`,

      payload

    );

  }


  // ===================================================
  // GET CHAT HISTORY
  // ===================================================

  getChatHistory(
    sessionId: string
  ): Observable<ChatHistoryResponse> {

    console.log(
      'CHAT SERVICE: Getting chat history'
    );

    return this.http.get<ChatHistoryResponse>(

      `${this.apiUrl}/chat/history/${encodeURIComponent(sessionId)}`

    );

  }


  // ===================================================
  // GET ALL CHAT SESSIONS
  // ===================================================

  getChatSessions(): Observable<ChatSessionsResponse> {

    console.log(
      'CHAT SERVICE: Getting chat sessions'
    );

    return this.http.get<ChatSessionsResponse>(

      `${this.apiUrl}/chat/sessions`

    );

  }

  // ===================================================
  // DELETE CHAT SESSION
  // ===================================================

  deleteChatSession(sessionId: string): Observable<any> {
    console.log('CHAT SERVICE: Deleting chat session', sessionId);
    return this.http.delete<any>(
      `${this.apiUrl}/chat/sessions/${encodeURIComponent(sessionId)}`
    );
  }


  // ===================================================
  // GET SEARCH HISTORY
  // ===================================================

  getSearchHistory(
    userId: number
  ): Observable<SearchHistoryResponse> {

    return this.http.get<SearchHistoryResponse>(

      `${this.apiUrl}/search/${userId}`

    );

  }

}
