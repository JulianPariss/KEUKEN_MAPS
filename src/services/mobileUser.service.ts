import { httpRequest } from "."
import type { IMobileUser } from "../utils/types/mobileUser.types"

const MOBILE_USER_ROUTE = '/mobileUser/'

export const getAllMobileUsers = async (enterprise_id: number, role?: string) : Promise<IMobileUser[]> => {
  return await httpRequest({
    url: MOBILE_USER_ROUTE,
    method: 'GET',
    params: {
      enterprise_id,
      role: role ?? 'VENDEDORES',
    },
    isAuth: true,
  })
}