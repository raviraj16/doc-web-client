import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Document, DocumentService } from '../../services/document';
import { TransformUtils } from '../../../../core/utils/transform-util';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.scss'
})
export class DocumentUpload implements OnInit {
  documentForm: FormGroup;
  selectedFiles: File[] = [];
  isEdit = false;
  documentId: string | null = null;
  loading = false;
  error: string | null = null;
  success = false;
  maxFileSize = 30 * 1024 * 1024; // 30MB in bytes

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.documentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id');
    if (this.documentId) {
      this.isEdit = true;
      this.loadDocument(this.documentId);
    }
  }

  loadDocument(id: string): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        this.documentForm.patchValue({
          title: doc.title,
          description: doc.description || '',
          tags: TransformUtils.checkArrayAndCreateString(doc.metadata?.tags)
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading document:', err);
        this.error = 'Failed to load document. Please try again.';
        this.loading = false;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > this.maxFileSize);
      if (oversizedFiles.length > 0) {
        alert(`The following files exceed the 30MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
        // Remove the oversized files
        input.value = ''; // Clear the input
        return;
      }
      
      this.selectedFiles = [...this.selectedFiles, ...files];
    }
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'far fa-file-pdf';
      case 'doc':
      case 'docx': return 'far fa-file-word';
      case 'xls':
      case 'xlsx': return 'far fa-file-excel';
      case 'ppt':
      case 'pptx': return 'far fa-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'far fa-file-image';
      default: return 'far fa-file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.documentForm.invalid) return;
    
    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.documentForm.value.title);
    
    if (this.documentForm.value.description) {
      formData.append('description', this.documentForm.value.description);
    }
    
    if (this.documentForm.value.tags) {
      formData.append('tags', this.documentForm.value.tags.trim());
    }
    
    this.selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    if (this.isEdit && this.documentId) {
      this.updateDocument(this.documentId, formData);
    } else {
      this.createDocument(formData);
    }
  }
  
  createDocument(formData: FormData): void {
    this.documentService.createDocument(formData).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/document']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error creating document:', err);
        this.error = 'Failed to create document. Please try again.';
        this.loading = false;
      }
    });
  }
  
  updateDocument(id: string, formData: FormData): void {
    this.documentService.updateDocument(id, formData).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/document']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating document:', err);
        this.error = 'Failed to update document. Please try again.';
        this.loading = false;
      }
    });
  }
  
  cancelForm(): void {
    this.router.navigate(['/document']);
  }

}
