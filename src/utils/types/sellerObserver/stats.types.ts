import type { IStandarState } from "../general.types";

export interface IMultipleSellerStatResponse extends ISellerStatResponse {
    seller: number;
}

export interface ISellerStatResponse {
    route_stats: ISellerStat;
}

export interface ISellerStat {
    total: number;
    dailyInRouteObjective: number;
    ordersCount: number;
    noSaleReasonCount: number;
    clients_in_route: number;
    clients_out_route: number;
    clients_justified: number;
    clientsCountOrders: number;
    clientsOutRouteCountOrders: number;
    clientsCountNoSaleReason: number;
    clientsOutRouteCountNoSaleReason: number;
    orders_in_route: number;
    orders_out_route: number;
    visits_gps_in_route: number;
    visits_gps_out_route: number;
}

export interface IComposedStats extends ISellerStat {
    clientsVisited: number;
    totalClients: number;
    clientsInRouteCountOrders: number;
    saleEffectivenessInRoute: number;
    totalClientsWithOrders: number;
    saleEffectivenessTotal: number;
    visitEffectiveness: number;
}

export interface IStatSlice extends IStandarState {
    statsBySellerId: { [key: number]: ISellerStat }
}