import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserForm } from './user-form';
import { UserManagement } from '../../services/user-management';
import { UserStore } from '../../../../core/services/user-store.service';
import { of } from 'rxjs';

describe('UserForm', () => {
  let component: UserForm;
  let fixture: ComponentFixture<UserForm>;

  beforeEach(async () => {
    const mockUserManagement = {
      getAllUsers: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn().mockReturnValue(of({ success: true, data: {} })),
      createUser: jest.fn().mockReturnValue(of({ success: true, data: {} })),
      updateUser: jest.fn().mockReturnValue(of({ success: true, data: {} }))
    };
    
    const mockUserStore = {
      getUser: jest.fn().mockReturnValue(null),
      setUser: jest.fn(),
      clearUser: jest.fn(),
      fetchUser: jest.fn(),
      user$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [UserForm, HttpClientTestingModule, RouterTestingModule.withRoutes([]), ReactiveFormsModule],
      providers: [
        { provide: UserManagement, useValue: mockUserManagement },
        { provide: UserStore, useValue: mockUserStore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
