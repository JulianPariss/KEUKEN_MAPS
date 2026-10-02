import { httpRequest } from "."
import type { INoVisitReason, INoVisitReasonCreation } from "../utils/types/novisitreason.types"

const BASE_PATH = '/no_visit_reason/'

export const getNotVisitReasons = async (enterprise_id: number): Promise<INoVisitReason[]> => {
    return await httpRequest({
        url: BASE_PATH,
        method: 'GET',
        params: {
            enterprise_id
        },
        isAuth: true,
    })
}

export const createNoVisitReason = async (enterprise_id: number, data: INoVisitReasonCreation): Promise<INoVisitReason> => {
    return await httpRequest({
        url: BASE_PATH,
        method: 'POST',
        params: {
            enterprise_id
        },
        data,
        isAuth: true,
    })
}

export const deleteNotVisitReason = async (enterprise_id: number, no_visit_reason_id: number): Promise<void> => {
    return await httpRequest({
        url: `${BASE_PATH}${no_visit_reason_id}`,
        method: 'DELETE',
        params: {
            enterprise_id
        },
        isAuth: true,
    })
}

export const updateNoVisitReason = async (enterprise_id: number, no_visit_reason_id: number, data: INoVisitReasonCreation): Promise<INoVisitReason> => {
    return await httpRequest({
        url: `${BASE_PATH}${no_visit_reason_id}`,
        method: 'PUT',
        params: {
            enterprise_id,
        },
        data,
        isAuth: true,
    })
}