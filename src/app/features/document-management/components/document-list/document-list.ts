import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Document, DocumentFile, DocumentService } from '../../services/document';
import { UserStore } from '../../../../core/services/user-store.service';
import { User } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { TransformUtils } from '../../../../core/utils/transform-util';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-list.html',
  styleUrl: './document-list.scss'
})
export class DocumentList implements OnInit {
  documents: Document[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  UserRole = UserRole;

  constructor(
    private documentService: DocumentService,
    private userStore: UserStore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userStore.user$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments()
      .subscribe({
        next: (data) => {
          this.documents = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching documents:', err);
          this.error = 'Failed to load documents. Please try again.';
          this.loading = false;
        }
      });
  }

  canEdit(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === UserRole.ADMIN ||
      this.currentUser.role === UserRole.EDITOR;
  }

  viewDocument(id: string): void {
    this.router.navigate(['/document/detail', id]);
  }

  editDocument(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/document/edit', id]);
  }

  deleteDocument(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id)
        .subscribe({
          next: () => {
            this.documents = this.documents.filter(doc => doc.id !== id);
          },
          error: (err) => {
            console.error('Error deleting document:', err);
            alert('Failed to delete document. Please try again.');
          }
        });
    }
  }

  displayTags(document: Document): string {
    return TransformUtils.checkArrayAndCreateString(document.metadata?.tags);
  }

  getFileCount(files: DocumentFile[]): number {
    return files ? files.length : 0;
  }

  getTags(document: Document): string[] {
    return TransformUtils.checkArrayOrCreateArray(document.metadata?.tags);
  }
  
}
