import type { IStandarState } from "../general.types";
import type { ITag } from "../tags.types";

export type TConnectionStatus = 'online' | 'offline' | 'unknow'

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

export interface ISeller {
    seller: number;
    sellerName: string;
    orders_count: number;
    no_sale_count: number;
    app_version: string;
    route: number[];
    color: string | null;
    has_order: boolean;
    clients_in_route_total: number;
    clients_justified: number;
    visited_clients: number;
    not_visited_clients: number;
    phoneNumber: string;
    state: string;
    open_date: string;
    close_date: string;
    dailyInRouteObjective: number;
    saving_energy_mode: boolean;
    total_amount: number;
    tags: ITag[]
}

export interface IUISeller {
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
    timestampUTC: string;
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

export interface ISellerState extends IStandarState {
    sellers: ISeller[],
    sellerById: { [key: number]: ISeller }
    sellersUI: { [key: number]: IUISeller }
    onlineStatus: { [key: number]: TConnectionStatus };
    sellerRoutes: {
        routes: TNestedRoutes;
        loading: boolean;
        error: any;
    };
    sellerOrders: {
        orders: { [key: number]: IOrder[] };
        loading: boolean;
        error: any;
    },
    sellerGps: {
        gps: { [key: number]: IGps[] };
        loading: boolean;
        error: any;
    }
    watchList: number[];
    filterList: number[];
    animation: {
        isAnimating: boolean;
        sellerAnimated: number | null;
    }
}

export interface IClient {
    location: {
        longitude: number | null;
        latitude: number | null;
    },
    name: string;
    address: string;
    code: number | string;
    phone: string;
    inRoute: boolean;
}

export interface IOrders {
    mobileUser: number;
    orders: IOrder[]
}

export interface IGps {
    id: number;
    mobileUser: number;
    lat: number;
    lon: number;
    timestamp: string;
    orderCode: string;
    orderType: number;
    provider: string;
    battery: string,
    collection: string;
    documentId: string;
    deliveryId: number;
    realUser: number;
    phoneNumber: string;
    deviceId: string;
    hasGps: boolean;
}

export interface IOrder {
    clientData: IClient;
    uuid: string;
    UID_mobile: string;
    total: number;
    totalWithTaxes: number;
    noSaleReason: string;
    noSaleReasonId: number;
    closed_lat: string;
    closed_long: string;
    open_lat: string;
    open_long: string;
    t_created: string;
    t_closed: string;
    battery: string | null;
    notInRadiusId: number | null;
    notInRadiusReason: string | null;
    saving_energy_mode: boolean | null;
}

export interface IOrderItem {
    promoId: number;
    totalValue_wIVA: number;
    enterprise: number;
    subTotalValue: number;
    closedBulk: boolean;
    client: number;
    quantity: number;
    priceList: number;
    margin: number;
    itemType: string
    promoDescription: string;
    isLostOpportunity: boolean;
    unitValue: number;
    orderUUID: string;
    description: string;
    order_id: number;
    unitValue_wIVA: number;
    providerCategoryId: string;
    qty_bonif: number;
    subTotalValue_wIVA: number;
    itemUUID: string;
    totalWeight: number;
    t_item: string;
    promoDiscount: number;
    totalValue: number;
    seller: number;
    id: number;
    code: number;
    providerCategory: string;
    discount: number;
}

export interface IOrderDetail extends IOrder {
    items: IOrderItem[];
}
