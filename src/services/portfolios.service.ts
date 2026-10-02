import { httpRequest } from "."
import type { IClientPortfolio } from "../utils/types/sellerObserver/clients.types";
import type { IPorfolioGeozone, IPorfolioGeozoneCreate, IPorfolioGeozoneRead, IPortfolio, IPortfolioUpdate } from "../utils/types/sellerObserver/portfolios.types";

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

export const addPortfolioGeozone = async (enterprise_id: number, data: IPorfolioGeozoneCreate): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: '/portfolio_geozone/',
    method: 'POST',
    params: {
      enterprise_id,
    },
    data,
    isAuth: true,
    isAsync: true,
  })
}

export const updatePortfolioGeozone = async (enterprise_id: number, pgId: number,  data: Partial<IPorfolioGeozoneCreate>): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: `/portfolio_geozone/${pgId}`,
    method: 'PUT',
    params: {
      enterprise_id,
    },
    data,
    isAuth: true,
    isAsync: true,
  })
}


export const removePortfolioGeozone = async (enterprise_id: number, pgId: number): Promise<any> => {
  return await httpRequest({
    url: `/portfolio_geozone/${pgId}`,
    method: 'DELETE',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}

export const getPortfolioGeozone = async (enterprise_id: number, pgId: number): Promise<IPorfolioGeozoneRead> => {
  return await httpRequest({
    url: `/portfolio_geozone/${pgId}`,
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
    isAsync: true,
  })
}

export const updateClientPortfolio = async (clientId: number, enterprise_id: number, newPortfolio: IPortfolioUpdate) => {
  return await httpRequest({
    url: `${PORTFOLIO_CLIENT_PATH}/update_links/${clientId}`,
    method: 'PUT',
    params: {
      enterprise_id,
    },
    data: newPortfolio,
    isAuth: true,
  })
}
