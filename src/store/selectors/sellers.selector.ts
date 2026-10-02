import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';

const selectOrders = (state: RootState) => state.sellers.sellerOrders;

const selectFilterSellers = (state: RootState) => state.sellers.filterList;

const selectWatchList = (state: RootState) => state.sellers.watchList;

export const getTotalSelledBySeller = (sellerId: number) =>
    createSelector([selectOrders], (sellerOrders): number => {
        if (sellerOrders.orders && sellerOrders.orders[sellerId])
            return sellerOrders.orders[sellerId].reduce((total, order) => total + order.total, 0)
        return 0
    }
    );

export const getTotalSelled = () =>
  createSelector([selectOrders, selectFilterSellers], (sellerOrders, filterList): number => {
    if (!sellerOrders.orders) return 0;
    return filterList.reduce((total, sellerId) => {
      const ordersForSeller = sellerOrders.orders[sellerId];
      if (ordersForSeller) {
        return total + ordersForSeller.reduce((sellerTotal, order) => sellerTotal + order.total, 0);
      }
      return total;
    }, 0);
  });


export const isFocussed = (id: number) =>
    createSelector([selectWatchList], (watchList): boolean =>
        watchList.length === 1 && watchList.includes(id)
    );

export const isSomeFocussed = () =>
    createSelector([selectWatchList], (watchList): boolean =>
        watchList.length === 1
    );

