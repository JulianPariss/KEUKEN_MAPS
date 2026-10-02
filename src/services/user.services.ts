import { httpRequest } from "."
import type { IEnterprise, IEnterpriseDetail } from "../utils/types/auth.types";
import type { IProfileResponse, IUser } from "../utils/types/sellerObserver/user.types";

export const  getProfileData = async (enterprise_id: number) : Promise<IProfileResponse> => {
    return await httpRequest({
      url: '/user/profile',
      method: 'GET',
      params: { enterprise_id },
      isAuth: true,
      isAsync: true,
    })
}

export const getAllUsers = async (enterprise_id: number) : Promise<IUser[]> => {
  return await httpRequest({
    url: '/user/',
    method: 'GET',
    params: { enterprise_id },
    isAuth: true,
  })
}

export const changeDefaultEnterprise = (enterprise: IEnterprise) => {
  localStorage.setItem("enterprise", JSON.stringify(enterprise))
}

export const getDefaultEnterprise = () : IEnterprise | null => {
  const defaultEnterprise = localStorage.getItem("enterprise") ?? null;
  return defaultEnterprise ? JSON.parse(defaultEnterprise) : null;
}

export const getEnterpriseDetail = async (enterprise_id: number) : Promise<IEnterpriseDetail> => {
  return await httpRequest({
    url: `/enterprise/${enterprise_id}`,
    method: 'GET',
    isAuth: true,
    isAsync: true,
  })
}