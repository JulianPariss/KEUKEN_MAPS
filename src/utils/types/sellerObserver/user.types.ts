import type { IEnterprise, IEnterpriseRole } from "../auth.types";
import type { IPermissionResponse } from "../permission.types";
import type { IFeatures } from "../sidebar.types";

export interface IProfile {
    username: string;
    type: string;
    userActives: number;
    maxUsers: number;
    features: IFeatures[];
    loading: boolean;
    error: string | null;
    permissions: string[];
}

export interface IProfileResponse {
    name: string;
    role: string;
    features: string[];
    permissions: IPermissionResponse[]
}

export interface IUserInfo {
    profile: IProfile;
    enterprise: IEnterprise;
}

export interface IUser {
    id: number;
    email: string;
    name: string;
    expiration_date: string;
    enterprises: IEnterpriseRole[];
}