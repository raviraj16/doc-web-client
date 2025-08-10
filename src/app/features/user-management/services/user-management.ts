import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse, UserResponse, DeleteUserResponse } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagement {
  private apiUrl = `${environment.baseUrl}/user`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(this.apiUrl);
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${this.apiUrl}/${id}`);
  }
}
