import { Routes } from '@angular/router';
import { UserList } from './components/user-list/user-list';
import { UserForm } from './components/user-form/user-form';
import { adminRoleGuard } from '../../core/guards/role-guard';

export const routes: Routes = [
    {
        path: '',
        component: UserList,
        canActivate: [adminRoleGuard]
    },
    {
        path: 'create',
        component: UserForm,
        canActivate: [adminRoleGuard]
    },
    {
        path: 'edit/:id',
        component: UserForm,
        canActivate: [adminRoleGuard]
    }
];
