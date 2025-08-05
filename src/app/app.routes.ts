import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(r => r.routes)
    },
    {
        path: 'user',
        canActivate: [authGuard],
        loadChildren: () => import('./features/user-management/user-management.routes').then(r => r.routes)
    },
    {
        path: 'document',
        canActivate: [authGuard],
        loadChildren: () => import('./features/document-management/document-management.routes').then(r => r.routes)
    },
    {
        path: 'ingestion',
        canActivate: [authGuard],
        loadChildren: () => import('./features/ingestion-management/ingestion-management.routes').then(r => r.routes)
    },
    {
        path: 'qna',
        canActivate: [authGuard],
        loadChildren: () => import('./features/qna/qna.routes').then(r => r.routes)
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
