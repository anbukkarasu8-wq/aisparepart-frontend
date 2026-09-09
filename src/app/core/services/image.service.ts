import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api-config';
import { ImageUploadResponse } from '../../models/image-upload';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private http: HttpClient) {}

  // Simple upload (no progress bar)
  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImageUploadResponse>(`${API_BASE_URL}/images/upload`, formData);
  }

  // Upload with progress tracking (recommended for UX)
  uploadImageWithProgress(file: File): Observable<HttpEvent<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImageUploadResponse>(`${API_BASE_URL}/images/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  deleteImage(path: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${API_BASE_URL}/images/${path}`);
  }
}