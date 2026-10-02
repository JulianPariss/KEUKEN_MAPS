import type { IStandarState } from "../general.types";
import type { IGeneralGeoZone } from "../geozones.types";
import type { ITag } from "../tags.types";
import type { TStatusDraft } from "./draft.types";

export interface IGeoZonesState extends IStandarState {
    geozones: IGeoZone[];
    filterList: number[];
    geozonesById: { [key: number]: number };
    watchList: number[];
}

export interface IGeoZone extends IGeneralGeoZone {
    draft_id: number;
    original_geozone_id: number;
    is_deleted: boolean;
    status: TStatusDraft;
    tags: ITag[];
}


export interface IGeoZoneCreation {
    draft_id: number;
    name: string;
    coordinates: number[][];
    color: string;
    original_geozone_id: number;
    is_deleted: boolean;
    tags: string[];
}