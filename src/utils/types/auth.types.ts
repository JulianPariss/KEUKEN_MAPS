import type { IStandarState } from "./general.types";

export type TAuth = 'PUBLIC' | 'CLIENT' | 'ADMIN'

export interface IEnterpriseRole {
    enterprise_id: number;
    role: string;
}

export interface IEnterprise {
  enterprise_id: number;
  name: string;
  sales_team: string[];
}

export interface IEnterpriseDetail extends IEnterprise {
    fullname: string;
    lat: number;
    lon: number;
}

export interface ILoginData {
    email: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
    user_id: number;
    enterprises: IEnterprise[];
    expiration_date: string | null;
}

export interface IAuth extends ILoginResponse{
    role: TAuth;
    isAuthenticated: boolean;
}

export interface IAuthState extends IStandarState {
    auth: IAuth;
}