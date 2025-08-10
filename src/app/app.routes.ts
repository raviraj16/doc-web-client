import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminRoleGuard } from './core/guards/role-guard';
import { AuthLayout } from './layout/components/auth-layout/auth-layout';
import { MainLayout } from './layout/components/main-layout/main-layout';


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
        component: MainLayout,
        canActivate: [authGuard, adminRoleGuard],
        loadChildren: () => import('./features/user-management/user-management.routes').then(r => r.routes)
    },
    {
        path: 'document',
        component: MainLayout,
        canActivate: [authGuard],
        loadChildren: () => import('./features/document-management/document-management.routes').then(r => r.routes)
    },
    {
        path: 'ingestion',
        component: MainLayout,
        canActivate: [authGuard],
        loadChildren: () => import('./features/ingestion-management/ingestion-management.routes').then(r => r.routes)
    },
    {
        path: 'qna',
        component: MainLayout,
        canActivate: [authGuard],
        loadChildren: () => import('./features/qna/qna.routes').then(r => r.routes)
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
