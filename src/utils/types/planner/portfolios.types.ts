import type { TStatusDraft } from "./draft.types";

export interface IPorfolioGeozone {
    portfolio_id: number;
    geozone_id: number;
    delivery_zone_id: number;
    id: number;
    draft_id: number;
}

export interface IPorfolioGeozoneRead extends IPorfolioGeozone {
    draft_id: number;
    frecuency: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    filter_id: number | null;
    original_portfolio_geozone_id: number;
    is_deleted: boolean;
    status: TStatusDraft;
    total_clients: number;
}

interface IPorfolioGeozoneCreateGeneric {
    draft_id: number;
    portfolio_id: number,
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
}

export interface IPorfolioGeozoneCreate extends IPorfolioGeozoneCreateGeneric {
    geozone_id: number,
}

export interface IPorfolioGeozoneCreateBulk extends IPorfolioGeozoneCreateGeneric {
    geozone_id: number[],
}
