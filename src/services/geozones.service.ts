import { httpRequest } from "."
import type { ICPDResponse } from "../utils/types/general.types"
import type { IGeoZone, IGeoZoneCreation } from "../utils/types/sellerObserver/geozones.types"

export const createGeoZone = async (enterprise_id: number, data: IGeoZoneCreation) : Promise<IGeoZone> => {
    return await httpRequest({
      url: '/geozone/',
      method: 'POST',
      params: { enterprise_id },
      isAuth: true,
      data,
    })
}

export const getAllGeozones = async (enterprise_id: number) : Promise<IGeoZone[]> => {
  return await httpRequest({
    url: '/geozone/',
    method: 'GET',
    params: { enterprise_id },
    isAuth: true,
  })
}

export const deleteGeoZone = async (geozone_id: number, enterprise_id: number) : Promise<ICPDResponse> => {
  return await httpRequest({
    url: `/geozone/${geozone_id}`,
    method: 'DELETE',
    params: { enterprise_id },
    isAuth: true,
  })
}

export const editGeoZone = async (geozone_id: number, enterprise_id: number, data: IGeoZoneCreation) : Promise<ICPDResponse> => {
  return await httpRequest({
    url: `/geozone/${geozone_id}`,
    method: 'PUT',
    params: { enterprise_id },
    isAuth: true,
    data
  })
}

export const bulkUpdateGeoZone = async (geozone_id: number, enterprise_id: number, data: any) : Promise<any> => {
  return await httpRequest({
    url: `/geozone/${geozone_id}/bulk-update`,
    method: 'PUT',
    params: { enterprise_id },
    isAuth: true,
    data
  })
}