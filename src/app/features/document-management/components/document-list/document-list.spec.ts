import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DocumentList } from './document-list';
import { DocumentService, Document, DocumentFile } from '../../services/document';
import { UserStore } from '../../../../core/services/user-store.service';
import { User } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';

describe('DocumentList', () => {
  let component: DocumentList;
  let fixture: ComponentFixture<DocumentList>;
  let documentServiceSpy: any;
  let userStoreSpy: any;
  let routerSpy: any;

  const mockFile: DocumentFile = {
    id: 'file1',
    fileName: 'test.pdf',
    fileUrl: '/uploads/test.pdf',
    fileSize: 137103,
    mimeType: 'application/pdf',
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
    files: [mockFile]
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
    const documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['getAllDocuments', 'deleteDocument']);
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['getUser']);
    userStoreSpyObj.user$ = of(adminUser);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DocumentList, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpyObj },
        { provide: UserStore, useValue: userStoreSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentList);
    component = fixture.componentInstance;
    documentServiceSpy = TestBed.inject(DocumentService);
    userStoreSpy = TestBed.inject(UserStore);
    routerSpy = TestBed.inject(Router);

    // Set up default mocks
    userStoreSpy.getUser.and.returnValue(adminUser);
    documentServiceSpy.getAllDocuments.and.returnValue(of([mockDocument]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documents on init', () => {
    component.ngOnInit();

    expect(documentServiceSpy.getAllDocuments).toHaveBeenCalled();
    expect(component.documents).toEqual([mockDocument]);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading documents', () => {
    documentServiceSpy.getAllDocuments.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load documents. Please try again.');
    expect(component.loading).toBe(false);
    expect(component.documents).toEqual([]);
  });

  it('should allow editing for admin user', () => {
    // Set the current user directly since ngOnInit sets it from the observable
    component.currentUser = adminUser;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(true);
  });

  it('should allow editing for editor user', () => {
    const editorUser: User = { ...adminUser, role: UserRole.EDITOR };
    component.currentUser = editorUser;

    const canEdit = component.canEdit();

    expect(canEdit).toBe(true);
  });

  it('should not allow editing for viewer user', () => {
    userStoreSpy.getUser.and.returnValue(viewerUser);

    const canEdit = component.canEdit();

    expect(canEdit).toBe(false);
  });

  it('should not allow editing when no user is logged in', () => {
    userStoreSpy.getUser.and.returnValue(null);

    const canEdit = component.canEdit();

    expect(canEdit).toBe(false);
  });

  it('should navigate to document detail when viewing document', () => {
    const documentId = '1';

    component.viewDocument(documentId);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/document/detail', documentId]);
  });

  it('should navigate to edit document', () => {
    const documentId = '1';
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');

    component.editDocument(documentId, mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/document/edit', documentId]);
  });

  it('should delete document after confirmation', () => {
    const documentId = '1';
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');
    spyOn(window, 'confirm').and.returnValue(true);
    documentServiceSpy.deleteDocument.and.returnValue(of({ deleted: true }));

    component.documents = [mockDocument];
    component.deleteDocument(documentId, mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this document?');
    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith(documentId);
    expect(component.documents).toEqual([]);
  });

  it('should not delete document when confirmation is cancelled', () => {
    const documentId = '1';
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteDocument(documentId, mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalled();
    expect(documentServiceSpy.deleteDocument).not.toHaveBeenCalled();
  });

  it('should handle error when deleting document', () => {
    const documentId = '1';
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    documentServiceSpy.deleteDocument.and.returnValue(throwError(() => new Error('Delete failed')));

    component.deleteDocument(documentId, mockEvent);

    expect(documentServiceSpy.deleteDocument).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to delete document. Please try again.');
  });

  it('should return correct file count', () => {
    const files: DocumentFile[] = [mockFile];
    const count = component.getFileCount(files);

    expect(count).toBe(1);
  });

  it('should return 0 for null files', () => {
    const count = component.getFileCount(null as any);

    expect(count).toBe(0);
  });

  it('should return document tags', () => {
    const tags = component.getTags(mockDocument);

    expect(tags).toEqual(['test', 'document']);
  });

  it('should return empty array for document without tags', () => {
    const documentWithoutTags: Document = {
      ...mockDocument,
      metadata: { tags: [] }
    };

    const tags = component.getTags(documentWithoutTags);

    expect(tags).toEqual([]);
  });

  it('should return empty array for document with null metadata', () => {
    const documentWithNullMetadata: Document = {
      ...mockDocument,
      metadata: null as any
    };

    const tags = component.getTags(documentWithNullMetadata);

    expect(tags).toEqual([]);
  });

  it('should display tags as comma separated string', () => {
    const displayTags = component.displayTags(mockDocument);

    expect(displayTags).toBe('test, document');
  });

  it('should return empty string for document without tags', () => {
    const documentWithoutTags: Document = {
      ...mockDocument,
      metadata: { tags: [] }
    };

    const displayTags = component.displayTags(documentWithoutTags);

    expect(displayTags).toBe('');
  });

  it('should subscribe to user updates', () => {
    // The user$ observable is already mocked in beforeEach, just trigger ngOnInit
    component.ngOnInit();

    expect(component.currentUser).toEqual(adminUser);
  });

  it('should handle loading state correctly', () => {
    // Check initial loading state without triggering detectChanges which causes router issues
    expect(component.loading).toBe(true);
    
    // Manually call loadDocuments to test loading state behavior
    component.loadDocuments();
    
    expect(component.loading).toBe(false);
  });
});
