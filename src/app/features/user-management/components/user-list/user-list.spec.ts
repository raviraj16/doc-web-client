import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserList } from './user-list';
import { UserManagement } from '../../services/user-management';
import { UserStore } from '../../../../core/services/user-store.service';
import { of } from 'rxjs';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;

  beforeEach(async () => {
    const mockUserManagement = {
      getAllUsers: jest.fn().mockReturnValue(of({ success: true, data: [], total: 0 })),
      deleteUser: jest.fn().mockReturnValue(of({ success: true, data: { id: '1', deleted: true } })),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn()
    };
    
    const mockUserStore = {
      getUser: jest.fn().mockReturnValue(null),
      setUser: jest.fn(),
      clearUser: jest.fn(),
      fetchUser: jest.fn(),
      user$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [UserList, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: UserManagement, useValue: mockUserManagement },
        { provide: UserStore, useValue: mockUserStore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
