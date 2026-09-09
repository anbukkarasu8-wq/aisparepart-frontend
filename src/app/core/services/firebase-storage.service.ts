import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot
} from 'firebase/storage';

import { firebaseApp } from '../../app.config';
import { API_BASE_URL } from '../../api-config';

export interface UploadProgressEvent {
  progress: number;
  downloadUrl?: string;
  storagePath?: string;
}

export interface BackendImageUploadResponse {
  success: boolean;
  message?: string;
  image_url?: string;
  storage_path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  // Allowed file extensions & mime types for ChatGPT-like upload
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  private readonly allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  // Maximum file size: 15MB
  private readonly maxFileSize = 15 * 1024 * 1024;

  constructor(private http: HttpClient) {}

  /**
   * Validate file format and size
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isMimeValid = this.allowedMimeTypes.includes(file.type.toLowerCase());
    const isExtValid = this.allowedExtensions.includes(extension);

    if (!isMimeValid && !isExtValid) {
      return {
        valid: false,
        error: 'Only JPG, JPEG, PNG, and WEBP image formats are supported.'
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Image size exceeds the maximum limit of ${this.maxFileSize / (1024 * 1024)}MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Upload image to Firebase Storage:
   * First tries direct client-side Firebase SDK upload.
   * If client upload is blocked by Firebase Security Rules (storage/unauthorized 403),
   * automatically falls back to backend Firebase Admin SDK service (/images/upload).
   */
  uploadChatbotImage(
    file: File,
    userId: string,
    sessionId: string
  ): Observable<UploadProgressEvent> {
    return new Observable<UploadProgressEvent>((observer) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        observer.error(new Error(validation.error || 'Invalid file.'));
        return;
      }

      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const effectiveUserId = userId || 'anonymous';
      const effectiveSessionId = sessionId || `session-${timestamp}`;
      const folderPath = `chatbot-images/${effectiveUserId}/${effectiveSessionId}`;
      const storagePath = `${folderPath}/${timestamp}_${sanitizedFileName}`;

      try {
        const storage = getStorage(firebaseApp);
        const fileRef = ref(storage, storagePath);

        const metadata = {
          contentType: file.type || 'image/jpeg',
          customMetadata: {
            userId: effectiveUserId,
            sessionId: effectiveSessionId,
            originalName: file.name
          }
        };

        const uploadTask = uploadBytesResumable(fileRef, file, metadata);

        observer.next({ progress: 0, storagePath });

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const bytesTransferred = snapshot.bytesTransferred;
            const totalBytes = snapshot.totalBytes;
            const progress = totalBytes > 0
              ? Math.round((bytesTransferred / totalBytes) * 100)
              : 0;

            observer.next({
              progress,
              storagePath
            });
          },
          (error) => {
            console.warn('Direct Firebase Storage upload failed:', error.code || error.message);

            // If storage permissions blocked on client side, transparently fallback to backend Admin SDK
            if (
              error.code === 'storage/unauthorized' ||
              error.code === 'storage/unknown' ||
              error.message?.includes('unauthorized')
            ) {
              console.log('Falling back to backend Firebase Admin Storage service...');
              this.uploadViaBackend(file, folderPath, effectiveSessionId, observer);
            } else {
              observer.error(new Error(this.getErrorMessage(error)));
            }
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              observer.next({
                progress: 100,
                downloadUrl,
                storagePath
              });
              observer.complete();
            } catch (urlError) {
              console.warn('Failed to get client download URL, attempting backend fallback:', urlError);
              this.uploadViaBackend(file, folderPath, effectiveSessionId, observer);
            }
          }
        );

        return () => {
          if (uploadTask.snapshot.state === 'running') {
            uploadTask.cancel();
          }
        };
      } catch (err: any) {
        console.warn('Client Firebase Storage init error, falling back to backend upload:', err);
        this.uploadViaBackend(file, folderPath, effectiveSessionId, observer);
        return;
      }
    });
  }

  /**
   * Fallback upload via backend endpoint /images/upload (uses Firebase Admin SDK)
   */
  private uploadViaBackend(
    file: File,
    folder: string,
    sessionId: string,
    observer: any
  ): void {
    const formData = new FormData();
    formData.append('image', file, file.name);
    formData.append('file', file, file.name);
    formData.append('folder', folder);
    formData.append('session_id', sessionId);

    this.http.post<BackendImageUploadResponse>(`${API_BASE_URL}/images/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: HttpEvent<BackendImageUploadResponse>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress, storagePath: folder });
        } else if (event.type === HttpEventType.Response) {
          const body = event.body as any;
          const image = body?.image;
          const imageUrl = image?.image_url;
          if (imageUrl) {
            observer.next({
              progress: 100,
              downloadUrl: imageUrl,
              storagePath: image?.storage_path || folder
            });
            observer.complete();
          } else {
            observer.error(new Error('Backend uploaded image but returned no download URL.'));
          }
        }
      },
      error: (err) => {
        console.error('Backend image upload error:', err);
        const errorMessage = err.error?.error || err.error?.message || 'Failed to upload image. Please try again.';
        observer.error(new Error(errorMessage));
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (!error) return 'Upload failed. Please try again.';
    switch (error.code) {
      case 'storage/unauthorized':
        return 'Permission denied: Please update Firebase Storage Security Rules or use backend upload.';
      case 'storage/canceled':
        return 'Upload was canceled.';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded.';
      case 'storage/retry-limit-exceeded':
        return 'Network timeout: Upload took too long. Please try again.';
      default:
        return error.message || 'Upload failed. Please check your connection and try again.';
    }
  }
}
