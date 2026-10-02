import { httpRequest } from "."
import type { IGps, ILocationParams, IRoute, RoutesByPhone, TNestedLastPositions } from "../utils/types/sellerObserver/sellers.types"

const LOCATION_PATH = '/location'

export const getRouteHistory = async (params : ILocationParams) : Promise<IRoute[]> => {
    return await httpRequest({
      url: `${LOCATION_PATH}/history`,
      method: 'GET',
      params,//: {...params, orderType: -2, batch_size: 25},
      isAuth: true,
      isAsync: true,
    })
} 

export const getRouteHistoryByPhone = async (params : ILocationParams) : Promise<RoutesByPhone> => {
    return await httpRequest({
      url: `${LOCATION_PATH}/history_by_phone`,
      method: 'GET',
      params: {...params, filter_type: 'distance_speed', low_pass_alpha: 1 /* filter_type: 'distance_speed', low_pass_alpha: 1 */},//: {...params, orderType: -2, batch_size: 25},
      isAuth: true,
      isAsync: true,
    })
} 

export const getValhallaRoute = async (params: ILocationParams): Promise<any> => {
  return await httpRequest({
    url: `${LOCATION_PATH}/history`,
    method: 'GET',
    params,
    isAuth: true,
    isAsync: true,
  })
}

/* export const getLastPosition = async (enterprise_id: number, mobileUser: number) : Promise<ILastPosition> => {
  return await httpRequest({
    url: `${LOCATION_PATH}/last/mobileUser`,
    method: 'GET',
    params: { enterprise_id, mobileUser },
    isAuth: true,
    isAsync: true,
  })
} */

export const getLastPositionByPhone = async (enterprise_id: number, mobileUser: number) : Promise<TNestedLastPositions> => {
  return await httpRequest({
    url: `${LOCATION_PATH}/last_by_phone`,
    method: 'GET',
    params: { enterprise_id, mobileUser },
    isAuth: true,
    isAsync: true,
  })
}

export const getGpsRecord = async (enterprise_id: number, routeDate: string) : Promise<IGps[]> => {
  return await httpRequest({
    url: `${LOCATION_PATH}/gps`,
    method: 'GET',
    params: {
      enterprise_id,
      routeDate,
    },
    isAuth: true,
  })
}