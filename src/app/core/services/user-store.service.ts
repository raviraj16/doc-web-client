import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthApi } from '../../features/auth/services/auth-api';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private authApi: AuthApi) { }

    fetchUser(): Observable<User> {
        return this.authApi.getMe().pipe(
            tap(user => {
                this.userSubject.next(user);
                sessionStorage.setItem('user', JSON.stringify(user));
            })
        );
    }

    getUser(): User | null {
        if (!this.userSubject.value) {
            const stored = sessionStorage.getItem('user');
            if (stored) {
                this.userSubject.next(JSON.parse(stored));
            }
        }
        return this.userSubject.value;
    }

    clearUser() {
        this.userSubject.next(null);
        sessionStorage.removeItem('user');
    }
}
