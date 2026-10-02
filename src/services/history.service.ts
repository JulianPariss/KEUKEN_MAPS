import { httpRequest } from "."
import type { ITagGroup } from "../utils/types/tags.types"
import type { IPolygon } from "../utils/types/sellerObserver/geozones.types"
import type { IClientStatus, IClientStatusFilter, IHistoryClient } from "../utils/types/sellerObserver/history.types"

export const  getHistoryClients = async (enterprise_id: number, days: null) : Promise<IHistoryClient[]> => {
    return await httpRequest({
      url: '/client/',
      method: 'GET',
      timeout: 60000,
      params: {
        days,
        enterprise_id,
        limit: 100000,
      },
      isAuth: true,
      isAsync: true,
    })
}

export const  getHistoryClientById = async (enterprise_id: number, client_id: number) : Promise<IHistoryClient> => {
    return await httpRequest({
      url: `/client/${client_id}`,
      method: 'GET',
      params: {
        enterprise_id
      },
      isAuth: true,
    })
}

export const getClientsIntoPolygon = async ( polygon: IPolygon, enterprise_id : number) : Promise<number[]> => {
  return await httpRequest({
    url: `/client/polygon`,
    method: 'POST',
    params: {
      enterprise_id,
    },
    data: {
      ...polygon
    },
    isAuth: true,
    isAsync: true,
  })
}

export const  getAllTags = async (enterprise_id: number, source?: string) : Promise<ITagGroup[]> => {
    return await httpRequest({
      url: `/tag/`,
      method: 'GET',
      params: {
        enterprise_id,
        source
      },
      isAuth: true,
      isAsync: true,
    })
}

export const getHistoryClientsStatus = async (enterprise_id: number, data?: IClientStatusFilter): Promise<IClientStatus[]> => {
    return await httpRequest({
        url: `/client/clients-portfolios`,
        method: 'POST',
        timeout: 60000,
        params: {
            enterprise_id,
        },
        data,
        isAuth: true,
        isAsync: false,
    })
}