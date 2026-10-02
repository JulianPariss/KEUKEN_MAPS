import { httpRequest } from "."
import type { IFilter, IFilterPack, IRemovedFilter } from "../utils/types/sellerObserver/filters.types";

const FILTER_PATH = '/filter/';


export const createNewFilter = async (enterprise_id: number, filter: IFilter): Promise<IFilterPack> => {
  return await httpRequest({
    url: `${FILTER_PATH}`,
    method: 'POST',
    params: {
      enterprise_id,
    },
    data: {
      ...filter
    },
    isAuth: true,
  })
}

export const removeFilter = async (enterprise_id: number, filter_id: number): Promise<IRemovedFilter> => {
  return await httpRequest({
    url: `${FILTER_PATH}${filter_id}`,
    method: 'DELETE',
    params: {
      enterprise_id,
    },
    isAuth: true,
  })
}

export const editFilter = async (enterprise_id: number, filter_id: number, filter: IFilter,): Promise<IFilterPack> => {
  return await httpRequest({
    url: `${FILTER_PATH}${filter_id}`,
    method: 'PUT',
    params: {
      enterprise_id,
    },
    data: {
      ...filter
    },
    isAuth: true,
  })
}

export const getFilters = async (enterprise_id: number): Promise<IFilterPack[]> => {
  return await httpRequest({
    url: '/filter_tag_value/',
    method: 'GET',
    params: {
      enterprise_id,
    },
    isAuth: true,
  })
}