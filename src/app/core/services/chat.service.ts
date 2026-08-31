import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// =====================================================
// CHAT MESSAGE
// =====================================================

export interface ChatMessage {

  id: number;

  session_id: string;

  role: 'user' | 'assistant';

  message: string;

  created_at?: string;

}


// =====================================================
// CHAT RESPONSE
// =====================================================

export interface ChatResponse {

  success: boolean;

  session_id: string;

  user_message: string;

  response: string;

}


// =====================================================
// CHAT HISTORY RESPONSE
// =====================================================

export interface ChatHistoryResponse {

  success: boolean;

  session_id: string;

  messages: ChatMessage[];

}


// =====================================================
// CHAT SESSION
// =====================================================

export interface ChatSession {

  session_id: string;

  last_message: string;

  created_at?: string;

}


// =====================================================
// CHAT SESSIONS RESPONSE
// =====================================================

export interface ChatSessionsResponse {

  success: boolean;

  sessions: ChatSession[];

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})

export class ChatService {


  private apiUrl =
    'http://localhost:3000';


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // SEND MESSAGE
  // ===================================================

  sendMessage(
    sessionId: string,
    message: string
  ): Observable<ChatResponse> {

    return this.http.post<ChatResponse>(

      `${this.apiUrl}/chat`,

      {

        session_id:
          sessionId,

        message:
          message

      }

    );

  }


  // ===================================================
  // GET CHAT HISTORY
  // ===================================================

  getChatHistory(
    sessionId: string
  ): Observable<ChatHistoryResponse> {

    return this.http.get<ChatHistoryResponse>(

      `${this.apiUrl}/chat/history/${encodeURIComponent(sessionId)}`

    );

  }


  // ===================================================
  // GET ALL CHAT SESSIONS
  // ===================================================

  getChatSessions():
    Observable<ChatSessionsResponse> {

    return this.http.get<ChatSessionsResponse>(

      `${this.apiUrl}/chat/sessions`

    );

  }

}