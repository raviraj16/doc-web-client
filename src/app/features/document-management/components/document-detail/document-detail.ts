import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Document, DocumentFile, DocumentService } from '../../services/document';
import { UserStore } from '../../../../core/services/user-store.service';
import { User } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { TransformUtils } from '../../../../core/utils/transform-util';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.scss'
})
export class DocumentDetail implements OnInit {
  document: Document | null = null;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  UserRole = UserRole;

  constructor(
    private documentService: DocumentService,
    private userStore: UserStore,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userStore.user$.subscribe(user => {
      this.currentUser = user;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(id);
    } else {
      this.error = 'Document ID is missing';
      this.loading = false;
    }
  }

  loadDocument(id: string): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        if (document.files && document.files.length > 0) {
          document.files.forEach(file => {
            file.fileUrl = this.documentService.getFileUrl(file.fileUrl);
          })
        }
        this.document = document;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.error = 'Failed to load document details.';
        this.loading = false;
      }
    });
  }

  canEdit(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === UserRole.ADMIN ||
      this.currentUser.role === UserRole.EDITOR;
  }

  editDocument(): void {
    if (this.document) {
      this.router.navigate(['/document/edit', this.document.id]);
    }
  }

  deleteDocument(): void {
    if (!this.document) return;

    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      this.documentService.deleteDocument(this.document.id).subscribe({
        next: () => {
          this.router.navigate(['/document']);
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.error = 'Failed to delete document. Please try again later.';
        }
      });
    }
  }

  getFileNameFromPath(fileName: string): string {
    return fileName;
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isPdf(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  isDocument(mimeType: string): boolean {
    return ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'].includes(mimeType);
  }

  isSpreadsheet(mimeType: string): boolean {
    return ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].includes(mimeType);
  }

  isPresentation(mimeType: string): boolean {
    return ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(mimeType);
  }

  getFileIcon(mimeType: string): string {
    if (this.isImage(mimeType)) return 'fa-file-image';
    if (this.isPdf(mimeType)) return 'fa-file-pdf';
    if (this.isDocument(mimeType)) return 'fa-file-word';
    if (this.isSpreadsheet(mimeType)) return 'fa-file-excel';
    if (this.isPresentation(mimeType)) return 'fa-file-powerpoint';
    return 'fa-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTags(): string[] {
    return TransformUtils.checkArrayOrCreateArray(this.document?.metadata?.tags);
  }
}
