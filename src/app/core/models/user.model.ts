import { UserRole } from "../enums/user-role.enum";

export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    email: string;
    password?: string; // Only for create/update operations
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    isActive: boolean;
}

export interface UpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    isActive?: boolean;
}

export interface UserListResponse {
    success: boolean;
    message: string;
    data: User[];
    total: number;
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface DeleteUserResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        deleted: boolean;
    };
}