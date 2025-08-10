import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService, Document, DocumentFile } from './document';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../../core/enums/user-role.enum';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  const mockDocument: Document = {
    id: '1',
    title: 'Test Document',
    description: 'Test Description',
    status: 0,
    metadata: {
      tags: ['test', 'document']
    },
    createdAt: '2025-08-10T05:01:54.644Z',
    updatedAt: '2025-08-10T05:01:54.644Z',
    uploadedById: 'user1',
    files: [
      {
        id: 'file1',
        fileName: 'test.pdf',
        fileUrl: '/uploads/test.pdf',
        fileSize: 137103,
        mimeType: 'application/pdf',
        documentId: '1'
      }
    ]
  };

  const mockDocumentList: Document[] = [mockDocument];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });

    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllDocuments', () => {
    it('should retrieve all documents', () => {
      service.getAllDocuments().subscribe(documents => {
        expect(documents).toEqual(mockDocumentList);
        expect(documents.length).toBe(1);
        expect(documents[0].title).toBe('Test Document');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocumentList);
    });

    it('should handle error when retrieving documents', () => {
      service.getAllDocuments().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getDocumentById', () => {
    it('should retrieve document by id', () => {
      const documentId = '1';

      service.getDocumentById(documentId).subscribe(document => {
        expect(document).toEqual(mockDocument);
        expect(document.id).toBe(documentId);
        expect(document.title).toBe('Test Document');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocument);
    });

    it('should handle error when document not found', () => {
      const documentId = 'nonexistent';

      service.getDocumentById(documentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      req.flush('Document not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createDocument', () => {
    it('should create a new document', () => {
      const formData = new FormData();
      formData.append('title', 'New Document');
      formData.append('description', 'New Description');
      formData.append('tags', 'new,test');

      service.createDocument(formData).subscribe(document => {
        expect(document).toEqual(mockDocument);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockDocument);
    });

    it('should handle error when creating document', () => {
      const formData = new FormData();
      formData.append('title', ''); // Invalid title

      service.createDocument(formData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document`);
      req.flush('Validation Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', () => {
      const documentId = '1';
      const formData = new FormData();
      formData.append('title', 'Updated Document');

      const updatedDocument = { ...mockDocument, title: 'Updated Document' };

      service.updateDocument(documentId, formData).subscribe(result => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(formData);
      req.flush({ success: true });
    });

    it('should handle error when updating non-existent document', () => {
      const documentId = 'nonexistent';
      const formData = new FormData();

      service.updateDocument(documentId, formData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      req.flush('Document not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', () => {
      const documentId = '1';

      service.deleteDocument(documentId).subscribe(result => {
        expect(result.deleted).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ deleted: true });
    });

    it('should handle error when deleting non-existent document', () => {
      const documentId = 'nonexistent';

      service.deleteDocument(documentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      req.flush('Document not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized deletion', () => {
      const documentId = '1';

      service.deleteDocument(documentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/document/${documentId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
