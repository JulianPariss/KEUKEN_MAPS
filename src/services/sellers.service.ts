import moment from "moment"
import { httpRequest } from "."
import type { ILocationParamsV3, IOrderDetail, IOrders, ISeller } from "../utils/types/sellerObserver/sellers.types"

const SELLER_ROUTE = '/seller_route'

export const getAllSellers = async (enterprise_id: number, routeDate: string): Promise<ISeller[]> => {
  return await httpRequest({
    timeout: 60000,
    url: `${SELLER_ROUTE}/routes`,
    method: 'GET',
    params: {
      enterprise: enterprise_id,
      routeDate: moment(routeDate).format('YYYY-MM-DD'),
    },
    isAuth: true,
  })
}

export const getOrders = async (params: ILocationParamsV3): Promise<IOrders[]> => {
  return await httpRequest({
    timeout: 80000,
    url: `${SELLER_ROUTE}/orders/list`,
    method: 'GET',
    params,
    isAuth: true,
    isAsync: true,
  })
}

export const getOrderDetail = async ({ enterprise, order_id }: { enterprise: string, order_id: string }): Promise<IOrderDetail> => {
  return await httpRequest({
    timeout: 60000,
    url: `${SELLER_ROUTE}/order_detail`,
    method: 'GET',
    params: { enterprise, order_id },
    isAuth: true,
    isAsync: false,
  })
}

export const setMobileUserColor = async (sellerId: number, color: string, enterprise_id: number): Promise<{ message: string }> => {
  return await httpRequest({
    url: '/mobileUser/',
    method: 'PUT',
    params: {
      enterprise_id
    },
    data: {
      id: sellerId,
      color,
    },
    isAuth: true,
  })
}
