import { httpRequest } from "."
import type { IAuth, ILoginData, ILoginResponse } from "../utils/types/auth.types"

export const authenticate = async (data: ILoginData) : Promise<ILoginResponse> => {
    return await httpRequest({
      url: '/user/login',
      method: 'POST',
      data
    })
}

export const validateSession = async () : Promise<void> => {
  return await httpRequest({
    url: '/user/validate-session',
    method: 'POST',
    isAuth: true,
    isAsync: true,
    isCancelable: false,
  })
} 

export const ClearLocalAuth = () => {
  localStorage.clear();
}

export const setLocalAuth = (data : ILoginResponse) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user_id", data.user_id.toString());
  localStorage.setItem("enterprises", JSON.stringify(data.enterprises));
  localStorage.setItem("expiration_Date", JSON.stringify(data.expiration_date));
}

export const GetLocalAuth = () : IAuth => {
  const userid: number = Number(localStorage.getItem('user_id') ?? -1);
  const token: string = localStorage.getItem('token') ?? '';
  const expDate: string | null = localStorage.getItem('expiration_Date') ?? null;

  const isAuthenticated: boolean = token!=='' && userid!==-1;
  const enterprises = localStorage.getItem('enterprises') ?? null;

  const authInfo : IAuth = {
    role: isAuthenticated ? "CLIENT" : "PUBLIC",
    isAuthenticated: isAuthenticated,
    enterprises: enterprises ? JSON.parse(enterprises) : [],
    token: token,
    user_id: userid,
    expiration_date: expDate ? JSON.parse(expDate) : null,
  }

  if(!(token && userid && enterprises)) {
    ClearLocalAuth();
  }


  return authInfo
} 