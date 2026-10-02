import { httpRequest } from "../"
import type { IPorfolioGeozoneCreate, IPorfolioGeozoneCreateBulk, IPorfolioGeozoneRead } from "../../utils/types/planner/portfolios.types"

/*
const PORTFOLIO_PATH = '/portfolio/';
const PORTFOLIO_CLIENT_PATH = '/portfolio_client';


export const getClientPortfolio = async (clientId: number, enterprise_id: number): Promise<IClientPortfolio[]> => {
  return await httpRequest({
    url: `${PORTFOLIO_CLIENT_PATH}/client/${clientId}`,
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
  })
}

export const getPortfolios = async (enterprise_id: number): Promise<IPortfolio[]> => {
  return await httpRequest({
    url: PORTFOLIO_PATH,
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
  })
}

export const getPortfolioGeozones = async (enterprise_id: number): Promise<IPorfolioGeozone[]> => {
  return await httpRequest({
    url: '/portfolio_geozone/',
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}


 */

export const removePortfolioGeozone = async (enterprise_id: number, draft_portfolio_geozone_id: number): Promise<any> => {
  return await httpRequest({
    url: `/draft_portfolio_geozones/${draft_portfolio_geozone_id}`,
    method: 'DELETE',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}



export const updatePortfolioGeozone = async (enterprise_id: number, draft_portfolio_geozone_id: number, data: Partial<IPorfolioGeozoneCreate>): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: `/draft_portfolio_geozones/${draft_portfolio_geozone_id}`,
    method: 'PUT',
    params: {
      enterprise_id,
    },
    data,
    isAuth: true,
    isAsync: true,
  })
}

export const getPortfolioGeozones = async (enterprise_id: number, draft_id: number): Promise<IPorfolioGeozoneRead[]> => {
  return await httpRequest({
    url: `/draft_portfolio_geozones/${draft_id}/portfolio_geozones`,
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}

export const getPortfolioGeozone = async (enterprise_id: number, draft_portfolio_geozone_id: number): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: `/draft_portfolio_geozones/${draft_portfolio_geozone_id}`,
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}

export const addPortfolioGeozone = async (enterprise_id: number, data: IPorfolioGeozoneCreate): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: '/draft_portfolio_geozones/',
    method: 'POST',
    params: {
      enterprise_id,
    },
    data,
    isAuth: true,
    isAsync: true,
  })
}

export const addAllPortfolioGeozones = async (enterprise_id: number, data: IPorfolioGeozoneCreateBulk): Promise<IPorfolioGeozoneRead[]> => {
  return await httpRequest({
    url: '/draft_portfolio_geozones/create',
    method: 'POST',
    params: {
      enterprise_id,
    },
    data,
    isAuth: true,
    isAsync: true,
  })
}


export const removeAllPortfolioGeozones = async (enterprise_id: number, draft_portfolio_geozone_ids : number[]): Promise<IPorfolioGeozoneRead[]> => {
  return await httpRequest({
    url: `/draft_portfolio_geozones/${draft_portfolio_geozone_ids}`,
    method: 'DELETE',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}