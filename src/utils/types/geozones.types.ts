import type { ITag } from "./tags.types";

export interface IGeneralGeoZone {
    name: string;
    coordinates: number[][];
    id: number;
    color: string;
    total_clients: number;
}

export interface IObserverGeodata {
    color?: string;
    geoname?: string;
    tags: ITag[];
    id?: number;
}

export interface IPlannerGeodata {
    color?: string;
    geoname?: string;
    tags: ITag[];
    id?: number;
    draft_id: number;
}


export interface IGeoZoneStandard {
    id: number;
    name: string;
    coordinates: number[][];
    color: string;
    tags: ITag[];
}

export interface IGeoZoneObserver {
    id: number;
    name: string;
    coordinates: number[][];
    color: string;
    tags: ITag[];
}

export interface IGeoZonePlanner {
    id: number;
    name: string;
    coordinates: number[][];
    color: string;
    original_geozone_id: number;
    tags: ITag[];
}