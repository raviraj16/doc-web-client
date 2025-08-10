import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { DocumentUpload } from './document-upload';
import { DocumentService } from '../../services/document';

describe('DocumentUpload', () => {
  let component: DocumentUpload;
  let fixture: ComponentFixture<DocumentUpload>;
  let documentServiceSpy: any;

  beforeEach(async () => {
    const documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['uploadDocument']);

    await TestBed.configureTestingModule({
      imports: [DocumentUpload, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn()
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentUpload);
    component = fixture.componentInstance;
    documentServiceSpy = TestBed.inject(DocumentService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
