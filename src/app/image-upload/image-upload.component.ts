import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ImageService } from '../core/services/image.service';
import { ImageUploadResponse } from '../models/image-upload';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  uploadedResult: ImageUploadResponse | null = null;
  error: string | null = null;
  isDragOver = false;

  private readonly validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSizeBytes = 10 * 1024 * 1024;

  constructor(private imageService: ImageService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  private handleFile(file: File): void {
    this.error = null;
    this.uploadedResult = null;

    if (!this.validTypes.includes(file.type)) {
      this.error = 'Only JPG, PNG, or WEBP images are allowed.';
      return;
    }

    if (file.size > this.maxSizeBytes) {
      this.error = 'File must be under 10MB.';
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.uploading = true;
    this.uploadProgress = 0;

    this.imageService.uploadImageWithProgress(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadedResult = event.body as ImageUploadResponse;
          this.uploading = false;
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.error = 'Upload failed. Please try again.';
        this.uploading = false;
      }
    });
  }

  removeImage(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.uploadedResult = null;
    this.error = null;
    this.uploadProgress = 0;
  }
}