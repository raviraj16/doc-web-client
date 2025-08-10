import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MainLayout } from './main-layout';
import { UserStore } from '../../../core/services/user-store.service';
import { AuthApi } from '../../../features/auth/services/auth-api';
import { User } from '../../../core/models/user.model';
import { UserRole } from '../../../core/enums/user-role.enum';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;
  let userStoreSpy: any;
  let authApiSpy: any;

  const mockUser: User = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: UserRole.ADMIN
  };

  beforeEach(async () => {
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['getUser', 'clearUser']);
    userStoreSpyObj.user$ = of(mockUser);
    const authApiSpyObj = jasmine.createSpyObj('AuthApi', ['getMe']);

    await TestBed.configureTestingModule({
      imports: [MainLayout, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UserStore, useValue: userStoreSpyObj },
        { provide: AuthApi, useValue: authApiSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    userStoreSpy = TestBed.inject(UserStore);
    authApiSpy = TestBed.inject(AuthApi);
    
    // Set up default mocks
    userStoreSpy.getUser.and.returnValue(mockUser);
    authApiSpy.getMe.and.returnValue(of(mockUser));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
