
export interface IPermissionResponse {
    key: string;
    description: string;
}

export interface IPermission {
    permission_id: number;
    key: string;
    description: string;
}

export interface IPermissionAssignment {
    user_id: number;
    enterprise_id: number;
    permissions: IPermission[]
}

export interface IPermissionListed {
    id: number;
    key: string;
    description: string;
    created_at: string;
}

export interface IPermissionAssignmentCreation {
    user_id: number;
    permission_ids: number[];
}