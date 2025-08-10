import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentDetail } from './document-detail';
import { Document, DocumentFile, DocumentService } from '../../services/document';
import { UserStore } from '../../../../core/services/user-store.service';
import { User } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';

describe('DocumentDetail', () => {
  let component: DocumentDetail;
  let fixture: ComponentFixture<DocumentDetail>;
  let documentServiceSpy: any;
  let userStoreSpy: any;
  let routerSpy: any;
  let activatedRouteSpy: any;

  const mockFile: DocumentFile = {
    id: 'file1',
    fileName: 'test.pdf',
    fileUrl: '/uploads/test.pdf',
    fileSize: 137103,
    mimeType: 'application/pdf',
    documentId: '1'
  };

  const mockImageFile: DocumentFile = {
    id: 'file2',
    fileName: 'image.png',
    fileUrl: '/uploads/image.png',
    fileSize: 50000,
    mimeType: 'image/png',
    documentId: '1'
  };

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
    files: [mockFile, mockImageFile]
  };

  const adminUser: User = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN
  };

  const viewerUser: User = {
    id: '2',
    firstName: 'Viewer',
    lastName: 'User',
    email: 'viewer@example.com',
    role: UserRole.VIEWER
  };

  beforeEach(async () => {
    const documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['getDocumentById', 'deleteDocument', 'getFileUrl']);
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['getUser']);
    userStoreSpyObj.user$ = of(adminUser);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpyObj = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DocumentDetail],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpyObj },
        { provide: UserStore, useValue: userStoreSpyObj },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetail);
    component = fixture.componentInstance;
    documentServiceSpy = TestBed.inject(DocumentService);
    userStoreSpy = TestBed.inject(UserStore);
    routerSpy = TestBed.inject(Router);
    activatedRouteSpy = TestBed.inject(ActivatedRoute);

    // Set up default mocks
    userStoreSpy.getUser.and.returnValue(adminUser);
    documentServiceSpy.getDocumentById.and.returnValue(of(mockDocument));
    documentServiceSpy.getFileUrl.and.returnValue('/api/files/test.pdf'); // Mock file URL transformation
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load document on init', fakeAsync(() => {
    component.ngOnInit();
    
    tick(); // Allow observable to complete

    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(documentServiceSpy.getDocumentById).toHaveBeenCalledWith('1');
    expect(component.document).toEqual(mockDocument);
    expect(component.loading).toBe(false);
  }));

  it('should handle error when loading document', () => {
    documentServiceSpy.getDocumentById.and.returnValue(throwError(() => new Error('Document not found')));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load document details.');
    expect(component.loading).toBe(false);
    expect(component.document).toBeNull();
  });

  it('should handle missing document ID', () => {
    activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.error).toBe('Document ID is missing');
    expect(component.loading).toBe(false);
    expect(documentServiceSpy.getDocumentById).not.toHaveBeenCalled();
  });

  it('should allow editing for admin user', () => {
    userStoreSpy.getUser.and.returnValue(adminUser);
    component.currentUser = adminUser;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(true);
  });

  it('should allow editing for editor user', () => {
    const editorUser: User = { ...adminUser, role: UserRole.EDITOR };
    userStoreSpy.getUser.and.returnValue(editorUser);
    component.currentUser = editorUser;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(true);
  });

  it('should not allow editing for viewer user', () => {
    userStoreSpy.getUser.and.returnValue(viewerUser);
    component.currentUser = viewerUser;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(false);
  });

  it('should not allow editing when no user is logged in', () => {
    component.currentUser = null;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(false);
  });

  it('should navigate to edit document', () => {
    component.document = mockDocument;

    component.editDocument();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/document/edit', '1']);
  });

  it('should not navigate to edit when no document is loaded', () => {
    component.document = null;

    component.editDocument();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should delete document after confirmation', () => {
    component.document = mockDocument;
    spyOn(window, 'confirm').and.returnValue(true);
    documentServiceSpy.deleteDocument.and.returnValue(of({ deleted: true }));

    component.deleteDocument();

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this document? This action cannot be undone.');
    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith('1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/document']);
  });

  it('should not delete document when confirmation is cancelled', () => {
    component.document = mockDocument;
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteDocument();

    expect(window.confirm).toHaveBeenCalled();
    expect(documentServiceSpy.deleteDocument).not.toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    component.document = mockDocument;
    spyOn(window, 'confirm').and.returnValue(true);
    documentServiceSpy.deleteDocument.and.returnValue(throwError(() => new Error('Delete failed')));

    component.deleteDocument();

    expect(component.error).toBe('Failed to delete document. Please try again later.');
    // Note: deleteDocument doesn't set loading state, so we don't test for it
  });

  it('should not delete when no document is loaded', () => {
    component.document = null;

    component.deleteDocument();

    expect(documentServiceSpy.deleteDocument).not.toHaveBeenCalled();
  });

  it('should correctly identify image files', () => {
    expect(component.isImage('image/png')).toBe(true);
    expect(component.isImage('image/jpeg')).toBe(true);
    expect(component.isImage('application/pdf')).toBe(false);
    expect(component.isImage('text/plain')).toBe(false);
  });

  it('should correctly identify PDF files', () => {
    expect(component.isPdf('application/pdf')).toBe(true);
    expect(component.isPdf('image/png')).toBe(false);
  });

  it('should correctly identify document files', () => {
    expect(component.isDocument('application/msword')).toBe(true);
    expect(component.isDocument('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    expect(component.isDocument('text/plain')).toBe(true);
    expect(component.isDocument('image/png')).toBe(false);
  });

  it('should correctly identify spreadsheet files', () => {
    expect(component.isSpreadsheet('application/vnd.ms-excel')).toBe(true);
    expect(component.isSpreadsheet('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
    expect(component.isSpreadsheet('text/csv')).toBe(true);
    expect(component.isSpreadsheet('image/png')).toBe(false);
  });

  it('should correctly identify presentation files', () => {
    expect(component.isPresentation('application/vnd.ms-powerpoint')).toBe(true);
    expect(component.isPresentation('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe(true);
    expect(component.isPresentation('image/png')).toBe(false);
  });

  it('should return correct file icon for different types', () => {
    expect(component.getFileIcon('image/png')).toBe('fa-file-image');
    expect(component.getFileIcon('application/pdf')).toBe('fa-file-pdf');
    expect(component.getFileIcon('application/msword')).toBe('fa-file-word');
    expect(component.getFileIcon('application/vnd.ms-excel')).toBe('fa-file-excel');
    expect(component.getFileIcon('application/vnd.ms-powerpoint')).toBe('fa-file-powerpoint');
    expect(component.getFileIcon('unknown/type')).toBe('fa-file');
  });

  it('should return file name directly', () => {
    const fileName = 'test-document.pdf';
    expect(component.getFileNameFromPath(fileName)).toBe(fileName);
  });

  it('should return correct file extension', () => {
    expect(component.getFileExtension('test.pdf')).toBe('pdf');
    expect(component.getFileExtension('image.PNG')).toBe('png');
    expect(component.getFileExtension('file_without_extension')).toBe('');
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
    expect(component.formatFileSize(1073741824)).toBe('1 GB');
    expect(component.formatFileSize(500)).toBe('500 Bytes');
  });

  it('should return document tags', () => {
    component.document = mockDocument;

    const tags = component.getTags();

    expect(tags).toEqual(['test', 'document']);
  });

  it('should return empty array when no document is loaded', () => {
    component.document = null;

    const tags = component.getTags();

    expect(tags).toEqual([]);
  });

  it('should return empty array when document has no tags', () => {
    component.document = { ...mockDocument, metadata: { tags: [] } };

    const tags = component.getTags();

    expect(tags).toEqual([]);
  });

  it('should subscribe to user store updates', () => {
    // The user$ observable is already mocked in beforeEach, just trigger ngOnInit
    component.ngOnInit();

    expect(component.currentUser).toEqual(adminUser);
  });
});