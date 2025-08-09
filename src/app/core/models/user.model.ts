import { UserRole } from "../enums/user-role.enum";

export interface User {
    id?:string;
    firstName: string;
    lastName: string;
    role: UserRole;
    email?: string;
}