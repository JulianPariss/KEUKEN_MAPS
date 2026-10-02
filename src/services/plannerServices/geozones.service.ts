import { httpRequest } from "../"
import type { IGeoZone, IGeoZoneCreation } from "../../utils/types/planner/geozones.types"

const GEOZONE_PATH = '/draft_geozones/'

export const createGeoZone = async (enterprise_id: number, data: IGeoZoneCreation): Promise<IGeoZone> => {
    return await httpRequest({
        url: `${GEOZONE_PATH}`,
        method: 'POST',
        params: { enterprise_id },
        isAuth: true,
        data,
    })
}

export const getAllGeozones = async (enterprise_id: number, draft_id: number): Promise<IGeoZone[]> => {
    return await httpRequest({
        url: `${GEOZONE_PATH}${draft_id}/geozones`,
        method: 'GET',
        params: { enterprise_id },
        isAuth: true,
    })
}

export const deleteGeoZone = async (draft_geozone_id : number, enterprise_id: number): Promise<void> => {
    return await httpRequest({
        url: `${GEOZONE_PATH}${draft_geozone_id}`,
        method: 'DELETE',
        params: { enterprise_id },
        isAuth: true,
    })
}

export const editGeoZone = async (draft_geozone_id: number, enterprise_id: number, data: IGeoZoneCreation): Promise<IGeoZone> => {
    return await httpRequest({
        url: `${GEOZONE_PATH}${draft_geozone_id}`,
        method: 'PUT',
        params: { enterprise_id },
        isAuth: true,
        data
    })
}