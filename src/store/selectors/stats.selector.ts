import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';
import type { IComposedStats } from '../../utils/types/sellerObserver/stats.types';

const selectStatsBySellerId = (state: RootState) => state.stats.statsBySellerId;

export const getComposedStats = (sellerId: number) =>
    createSelector([selectStatsBySellerId], (statsBySellerId): IComposedStats => {
        if (statsBySellerId && statsBySellerId[sellerId]) {
            const sellerStat = statsBySellerId[sellerId];

            const clientsVisited = sellerStat.visits_gps_out_route + sellerStat.visits_gps_in_route;
            const totalClients = sellerStat.clients_in_route + sellerStat.clients_out_route;
            const clientsInRouteCountOrders = sellerStat.clientsCountOrders !== undefined && sellerStat.clientsOutRouteCountOrders !== undefined
                ? (sellerStat.clientsCountOrders - sellerStat.clientsOutRouteCountOrders)
                : 0;
            const saleEffectivenessInRoute = (totalClients > 0 && sellerStat?.clients_in_route > 0)
                ? (clientsInRouteCountOrders / sellerStat?.clients_in_route * 100)
                : 0;

            const totalClientsWithOrders = sellerStat.clientsOutRouteCountOrders + clientsInRouteCountOrders;

            const saleEffectivenessTotal = (totalClients > 0)
                ? (totalClientsWithOrders / totalClients * 100)
                : 0;

            const visitEffectiveness = (totalClients > 0)
                ? (clientsVisited / totalClients * 100)
                : 0;

            const composedStats = {
                ...sellerStat,
                clientsVisited: clientsVisited ?? 0,
                totalClients: totalClients ?? 0,
                clientsInRouteCountOrders: clientsInRouteCountOrders ?? 0,
                saleEffectivenessInRoute: saleEffectivenessInRoute ?? 0,
                totalClientsWithOrders: totalClientsWithOrders ?? 0,
                saleEffectivenessTotal: saleEffectivenessTotal ?? 0,
                visitEffectiveness: visitEffectiveness ?? 0,
            }

            return composedStats;
        }
        return {
            clientsVisited: 0,
            totalClients: 0,
            clientsInRouteCountOrders: 0,
            saleEffectivenessInRoute: 0,
            totalClientsWithOrders: 0,
            saleEffectivenessTotal: 0,
            visitEffectiveness: 0,
            total: 0,
            dailyInRouteObjective: 0,
            ordersCount: 0,
            noSaleReasonCount: 0,
            clients_in_route: 0,
            clients_out_route: 0,
            clients_justified: 0,
            clientsCountOrders: 0,
            clientsOutRouteCountOrders: 0,
            clientsCountNoSaleReason: 0,
            clientsOutRouteCountNoSaleReason: 0,
            orders_in_route: 0,
            orders_out_route: 0,
            visits_gps_in_route: 0,
            visits_gps_out_route: 0
        }
    }
    );