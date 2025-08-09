import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { Router } from '@angular/router';
import { UserStore } from '../../../core/services/user-store.service';

export interface UserRegistration extends User {
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  constructor(private http: HttpClient, private router: Router) { }

  login(data: UserLogin): Observable<any> {
    return this.http.post(`${environment.baseUrl}/auth/login`, data, { withCredentials: true });
  }

  register(data: UserRegistration): Observable<any> {
    return this.http.post(`${environment.baseUrl}/auth/signup`, data);
  }

  getMe(): Observable< User | null > {
    return this.http.get<{ data: User | null }>(`${environment.baseUrl}/auth/me`, { withCredentials: true })
     .pipe(
        map(response => {
          return response.data;
        })
      );
  }
  refreshToken(): Observable<any> {
    return this.http.get<{ data: User | null }>(`${environment.baseUrl}/auth/refresh`, { withCredentials: true });
     
  }
}
