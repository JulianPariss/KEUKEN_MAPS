import type { IStandarState } from "../general.types";

export interface IPortfolioState extends IStandarState {
    porfolios: IPortfolio[];
    portfoliosById: { [key: number]: number };
    sellersPortfolios: { [key: number]: IPortfolio[] };
    visible: boolean;
    watchList: number[];
}

export interface IPortfolioUpdate {
    portfolio_id: number[];
    execution_date: string | null;
}

export interface IPortfolio {
    id: number;
    name: string;
    mobileUser: number;
    isActive: boolean;
}

export interface IPorfolioGeozone {
    portfolio_id: number,
    geozone_id: number,
    delivery_zone_id: number,
    id: number
}

export interface IPorfolioGeozoneRead extends IPorfolioGeozone {
    frecuency: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    filter_id: number | null;
}

export interface IPorfolioGeozoneCreate {
    portfolio_id: number,
    geozone_id: number,
    delivery_zone_id: number | null,
    filter_id: number | null;
    frecuency: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    start_date: string | null;
}
