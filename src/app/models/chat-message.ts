export type ChatRole =
  | 'user'
  | 'assistant';


export interface ChatMessage {
  id: number;

  session_id: string;

  role: ChatRole;

  message: string;

  created_at?: string;
}


// =====================================================
// FRONTEND MESSAGE
// =====================================================

export interface UiMessage {

  id: number;

  role: ChatRole;

  text: string;

  time: string;

  created_at?: string;

  message?: string;
}