import { httpRequest } from "."
import type { IMultipleSellerStatResponse, ISellerStat } from "../utils/types/sellerObserver/stats.types"

const SELLER_ROUTE = '/seller_route'

export const getSellerStatsById = async ({ enterprise, sellerId, startDate }: { enterprise: number, sellerId: number, startDate: string, }): Promise<ISellerStat> => {
    return await httpRequest({
        url: `${SELLER_ROUTE}/stats`,
        method: 'GET',
        params: { enterprise, fecha_inicio: startDate, mobileUser: sellerId },
        isAuth: true,
        isAsync: false,
    })
}

export const getAllSellersStats = async (
    { enterprise, sellersIds, startDate }: { enterprise: number, sellersIds: number[], startDate: string }): Promise<IMultipleSellerStatResponse[]> => {
    const response = await httpRequest({
        url: `${SELLER_ROUTE}/stats`,
        method: 'GET',
        params: { enterprise, fecha_inicio: startDate, mobileUser: sellersIds.join(',') },
        isAuth: true,
        isAsync: false,
    }) as IMultipleSellerStatResponse[] | ISellerStat;

    if (Array.isArray(response)) {
        return response;
    } else {
        return [
            {
                seller: sellersIds[0],
                route_stats: response
            }
        ];
    }
} 
