import type { IStandarState } from "../general.types";
import type { IMobileUser } from "../mobileUser.types";
import type { IFDriverConfig } from "@repo/api-contracts/firebase";

export type TNestedRoutes = { [key: number]: { [key: string]: IRoute[] } };

export interface ILocationParams {
    enterprise_id: number;
    fecha_inicio: string;
    mobileUser: number;
}

export interface ILocationParamsV2 {
    routeDate: string;
    enterprise: number;
    seller: number;
}

export interface ILocationParamsV3 {
    routeDate: string;
    enterprise: number;
    mobileUser?: number;
}


export interface IUIDriver {
    color: string | null;
}

export interface RoutesByPhone { [key: string]: IRoute[] }

export interface IRoute {
    id: number;
    lat: number;
    lon: number;
    timestamp: string,
    orderCode: string | null,
    orderType: number | null,
    provider: string | null,
    battery: string | null,
    collection: string | null,
    documentId: string | null,
    deliveryId: number | null
}

export interface ISSERoute {
    battery: string | null;
    deliveryId: number | null
    enterprise: number | null
    lat: string | number;
    lng: string | number;
    orderType: number | null;
    provider: string | null;
    timestamp: string;
    userId: number;
    deviceId: string;
}

export interface ILastPosition extends IRoute {
    enterprise_id: number;
    mobileUser_list: {
        id: number;
        supervisorId: number;
        name: string;
        role: string;
    },
}

export interface ILastPositionByPhone extends IRoute {
    enterprise_id: number;
    mobileUser_list: {
        id: number;
        supervisorId: number;
        name: string;
        role: string;
        phoneNumber: string;
    },
}

export type TNestedLastPositions = Record<string, ILastPositionByPhone>

export interface IDriverState extends IStandarState {
    drivers: IMobileUser[];
    driverById: { [key: number]: IMobileUser };
    driversUI: { [key: number]: IUIDriver };
    configByDriverId: Record<number | string, IFDriverConfig>;
    driverRoutes: {
        routes: TNestedRoutes;
        loading: boolean;
        error: any;
    };
    watchList: number[];
    filterList: number[];
    animation: {
        isAnimating: boolean;
        driverAnimated: number | null;
    };
}




