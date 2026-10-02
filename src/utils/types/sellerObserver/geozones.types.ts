import type { IStandarState } from "../general.types";
import type { IGeneralGeoZone } from "../geozones.types";
import type { ITag } from "../tags.types";

export interface IGeoZone extends IGeneralGeoZone{
    tags: ITag[];
}

export interface IGeoZoneCreation {
    name: string;
    coordinates: number[][];
    id: number;
    color: string;
    tags: string[];
}

export interface IGeoZonesState extends IStandarState {
    geozones: IGeoZone[];
    geozonesById: {[key: number] : number};
    watchList: number[];
    filterList: number[];
}

export interface IPolygon {
    polygon: {lat: number, lon: number}[];
}

export function geoToPolygon(geo:IGeoZone) : any {
  const polygon: { lat: number; lon: number }[] = geo.coordinates.map(([lat, lon]) => ({
        lat,
        lon,
    }));
   return {
    polygon
   }
}   