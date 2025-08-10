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

    fetchUser(): Observable<User | null> {
        return this.authApi.getMe().pipe(
            tap(user => {
                this.userSubject.next(user);
                try {
                    if (user && typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                } catch (error) {
                    console.warn('Failed to save user data to session storage:', error);
                }
            })
        );
    }

    getUser(): User | null {
        if (!this.userSubject.value) {
            try {
                if (typeof sessionStorage !== 'undefined') {
                    const stored = sessionStorage.getItem('user');
                    if (stored) {
                        const parsedUser = JSON.parse(stored);
                        this.userSubject.next(parsedUser);
                    }
                }
            } catch (error) {
                // Handle corrupted session storage data or missing sessionStorage
                console.warn('Failed to parse user data from session storage:', error);
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('user');
                }
            }
        }
        return this.userSubject.value;
    }

    setUser(user: User | null): void {
        this.userSubject.next(user);
        try {
            if (user && typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('user', JSON.stringify(user));
            } else if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('user');
            }
        } catch (error) {
            console.warn('Failed to save user data to session storage:', error);
        }
    }

    clearUser() {
        this.userSubject.next(null);
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('user');
            }
        } catch (error) {
            console.warn('Failed to remove user data from session storage:', error);
        }
    }
}
