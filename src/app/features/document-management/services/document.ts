import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DocumentFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  documentId: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  status: number;
  metadata: {
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  files: DocumentFile[];
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.baseUrl}/document`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.baseUrl);
  }

  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.baseUrl}/${id}`);
  }

  createDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.baseUrl, formData);
  }

  updateDocument(id: string, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, formData);
  }

  deleteDocument(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }

  getFileUrl(filePath: string): string {
    return `${environment.baseUrl}${filePath}`;
  }
}
