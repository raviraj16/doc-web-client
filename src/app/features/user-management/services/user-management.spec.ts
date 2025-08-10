import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserManagement } from './user-management';

describe('UserManagement', () => {
  let service: UserManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserManagement]
    });
    service = TestBed.inject(UserManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
