import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatSessionsService {
  private baseUrl = environment.apiUrl; // e.g., https://your-api-domain.com

  constructor(private http: HttpClient) {}

  getSessions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/chat/sessions`).pipe(
      timeout(10000),
      catchError((err) => {
        console.error('getSessions failed:', err.message || err);
        return of({ data: [] });
      })
    );
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/chat/${sessionId}`).pipe(
      timeout(10000),
      catchError((err) => {
        console.error('deleteSession failed:', err.message || err);
        throw err;
      })
    );
  }
}
