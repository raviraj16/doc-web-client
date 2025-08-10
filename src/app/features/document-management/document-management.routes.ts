import { Routes } from '@angular/router';
import { DocumentList } from './components/document-list/document-list';
import { DocumentDetail } from './components/document-detail/document-detail';
import { DocumentUpload } from './components/document-upload/document-upload';
import { roleGuard } from '../../core/guards/role-guard';
import { UserRole } from '../../core/enums/user-role.enum';
import { authGuard } from '../../core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: DocumentList,
        canActivate: [authGuard]
    },
    {
        path: 'detail/:id',
        component: DocumentDetail,
        canActivate: [authGuard]
    },
    {
        path: 'upload',
        component: DocumentUpload,
        canActivate: [authGuard, roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.EDITOR] }
    },
    {
        path: 'edit/:id',
        component: DocumentUpload,
        canActivate: [authGuard, roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.EDITOR] }
    }
];
