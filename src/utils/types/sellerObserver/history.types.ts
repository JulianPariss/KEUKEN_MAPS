import type { IStandarState, TDayKey } from "../general.types";
import type { ITag } from "../tags.types";

export interface IHistoryPortfolio {
    id: number;
    frecuency: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    start_date: string;
    mobile_user: number | null;
}

export interface IHistoryClient {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    visited: boolean;
    mobileUser: string;
    frecuency: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    portfolio_ids: number[];
    portfoliolist: IHistoryPortfolio[];
    last_sale: string | null;
    excluded: boolean;
    tags: ITag[];
}
export interface IClientStatus {
    client_id: number;
    portfoliolist: number[];
}

export interface IClientStatusFilter {
    filter_id: number | null;
    channel: string[];
    supra_channel: string[];
    distribution_channel: string[];
}

export type THistoryDayKey = TDayKey | 'unknow';
export type IDayState = Record<THistoryDayKey, boolean>;

export interface IHistoryState extends IStandarState {
    clients: IHistoryClient[];
    clientsById: { [key: number]: number }
    watchList: number[];
    filterList: number[];
    excludeLoadingById: boolean[];
}