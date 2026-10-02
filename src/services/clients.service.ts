import { httpRequest } from "."
import type { IClient } from "../utils/types/sellerObserver/clients.types"

export const  getAllClients = async (enterprise_id: number, date: string) : Promise<IClient[]> => {
    return await httpRequest({
      url: '/seller_route/clients',
      method: 'GET',
      params: {
        routeDate: date,
        enterprise: enterprise_id
      },
      isAuth: true,
    })
}
