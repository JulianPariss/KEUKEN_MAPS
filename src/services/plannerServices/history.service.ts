import { httpRequest } from "../"
import type { IClientStatus, IClientStatusFilter, IHistoryClient } from "../../utils/types/sellerObserver/history.types"

export const getHistoryDraftClients = async (enterprise_id: number, draft_id: number): Promise<IHistoryClient[]> => {
    return await httpRequest({
        url: `/draft_client/drafts/${draft_id}/all_clients_preview`,
        method: 'GET',
        timeout: 60000,
        params: {
            enterprise_id,
        },
        isAuth: true,
        isAsync: true,
    })
}

export const getHistoryDraftClientsStatus = async (enterprise_id: number, draft_id: number, data?: IClientStatusFilter): Promise<IClientStatus[]> => {
    return await httpRequest({
        url: `/draft_client/drafts/${draft_id}/clients-portfolios`,
        method: 'POST',
        timeout: 60000,
        params: {
            enterprise_id,
        },
        data,
        isAuth: true,
        isAsync: false,
    })
}

export const getHistoryDraftClientsStatusPreview = async (enterprise_id: number, draft_id: number): Promise<IHistoryClient[]> => {
    return await httpRequest({
        url: `/draft_client/drafts/${draft_id}/all_clients_preview`,
        method: 'GET',
        timeout: 60000,
        params: {
            enterprise_id,
        },
        isAuth: true,
        isAsync: false,
    })
}