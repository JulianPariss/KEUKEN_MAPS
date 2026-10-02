import { httpRequest } from "."
import type { IExcludedClient } from "../utils/types/excludedClients.types";

const EXCLIENT_PATH = '/excluded_client/';

export const createExcludedClient = async (enterprise_id: number, data: { client_id: number }): Promise<IExcludedClient> => {
    return await httpRequest({
        url: EXCLIENT_PATH,
        method: 'POST',
        params: {
            enterprise_id,
        },
        data,
        isAuth: true,
        isAsync: true,
    })
}

export const getAllExcludedClients = async (enterprise_id: number): Promise<IExcludedClient[]> => {
    return await httpRequest({
        url: EXCLIENT_PATH,
        method: 'GET',
        params: {
            enterprise_id,
        },
        isAuth: true,
    })
}

export const getExcludedClient = async (enterprise_id: number, excluded_client_id: number): Promise<IExcludedClient[]> => {
    return await httpRequest({
        url: `${EXCLIENT_PATH}${excluded_client_id}`,
        method: 'GET',
        params: {
            enterprise_id,
        },
        isAuth: true,
    })
}

export const deleteExcludedClient = async (enterprise_id: number, excluded_client_id: number): Promise<IExcludedClient[]> => {
    return await httpRequest({
        url: `${EXCLIENT_PATH}${excluded_client_id}`,
        method: 'DELETE',
        params: {
            enterprise_id,
        },
        isAuth: true,
        isAsync: true,
    })
}