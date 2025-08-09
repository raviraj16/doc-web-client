import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminRoleGuard } from './core/guards/role-guard';
import { AuthLayout } from './layout/components/auth-layout/auth-layout';


export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        component: AuthLayout,
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(r => r.routes)
    },
    {
        path: 'user',
        canActivate: [authGuard, adminRoleGuard],
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
