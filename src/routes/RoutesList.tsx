import React, { lazy, type LazyExoticComponent } from "react"
import type { TAuth } from "../utils/types/auth.types";
import { Navigate } from "react-router";

const LoginPage = lazy(() => import('../pages/login'));
const NotFoundPage = lazy(() => import('../pages/notFound'));
const HomePage = lazy(() => import('../pages/home'));
const ConfigPage = lazy(() => import('../pages/configuration'));

export const lazyRedirect = (to: string) =>
  lazy(() =>
    Promise.resolve({
      default: () => <Navigate to={to} replace />,
    }),
);

type TRoutesNames = 'ANY' | 'ROOT' |'LOGIN' | 'NOT_FOUND' | 'REDIRECT' | 'CONFIG'

interface IRoute {
    authReq: TAuth[]; 
    path: string;
    page: LazyExoticComponent<React.ComponentType<any>>;
    withLayout: boolean;
}


// Podria separar las rutas en dos listas, una para Private y otras para Public.
const RoutesList : Record<TRoutesNames, IRoute> = {
    ANY: {
        authReq: ['CLIENT', 'ADMIN'],
        path: '*',
        page: lazyRedirect('/'),
        withLayout: false,
    },
    ROOT: {
        authReq: ['CLIENT', 'ADMIN'],
        path: '/',
        page: HomePage,
        withLayout: true,
    },
    NOT_FOUND: {
        authReq: ['CLIENT', 'ADMIN'],
        path: '/404',
        page: NotFoundPage,
        withLayout: false,
    },  
    CONFIG: {
        authReq: ['CLIENT', 'ADMIN'],
        path: '/configuration',
        page: ConfigPage,
        withLayout: false,
    },
    REDIRECT: {
        authReq: ['PUBLIC'],
        path: '*',
        page: LoginPage,
        withLayout: false,
    },
    LOGIN: {
        authReq: ['PUBLIC'],
        path: '/login',
        page: LoginPage,
        withLayout: false,
    },
}

const ValidatePermissions = (pReq: TAuth[], pHave: TAuth) => {
    return pReq.includes(pHave);
}

export const GetRoutes = (userRole: TAuth) : IRoute[] => {
    const arrayRoutes = Object.values(RoutesList)
    return arrayRoutes.filter((route) => ValidatePermissions(route.authReq, userRole))
}
