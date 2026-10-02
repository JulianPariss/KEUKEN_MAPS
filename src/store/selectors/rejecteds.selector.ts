import type { RootState } from '../index';
import type { IFRejected } from '@repo/api-contracts/firebase';
import { buildDeliveryClientKey } from '../slices/driverObserver/rejectedsSlice';

export interface IRejectedsSummary {
    rejectedAmount: number;
}

const selectRejectedsByDeliveryIdState = (state: RootState) => state.rejecteds?.rejectedsByDeliveryId;
const selectDeliveriesByDriverId = (state: RootState) => state.deliveries?.deliveriesByDriverId;
const selectLoadingByDeliveryId = (state: RootState) => state.rejecteds?.loadingByDeliveryId;

export const getRejectedsSummaryByDriverId = (state: RootState, driverId: number): IRejectedsSummary => {
    let rejectedAmount = 0;
    const rejectedsByDeliveryId = selectRejectedsByDeliveryIdState(state);
    const deliveriesByDriverId = selectDeliveriesByDriverId(state);

    if (!rejectedsByDeliveryId || !deliveriesByDriverId) {
        return { rejectedAmount };
    }

    const deliveries = deliveriesByDriverId[driverId];
    if (deliveries && deliveries.length > 0) {
        for (const delivery of deliveries) {
            if (delivery.id != null) {
                const rejecteds = rejectedsByDeliveryId[delivery.id];
                if (rejecteds && rejecteds.length > 0) {
                    for (const rejected of rejecteds) {
                        rejectedAmount += Number(rejected.rejectedAmount || 0);
                    }
                }
            }
        }
    }

    return { rejectedAmount };
};

export const getRejectedsSummaryByDeliveryIds = (state: RootState, deliveryIds: number[]): IRejectedsSummary => {
    let rejectedAmount = 0;
    const rejectedsByDeliveryId = selectRejectedsByDeliveryIdState(state);

    if (!rejectedsByDeliveryId) {
        return { rejectedAmount };
    }

    for (const deliveryId of deliveryIds) {
        const rejecteds = rejectedsByDeliveryId[deliveryId];
        if (rejecteds && rejecteds.length > 0) {
            for (const rejected of rejecteds) {
                rejectedAmount += Number(rejected.rejectedAmount || 0);
            }
        }
    }

    return { rejectedAmount };
};

export const getRejectedsSummaryByDeliveryId = (state: RootState, deliveryId: number): IRejectedsSummary => {
    let rejectedAmount = 0;
    const rejectedsByDeliveryId = selectRejectedsByDeliveryIdState(state);

    if (!rejectedsByDeliveryId) {
        return { rejectedAmount };
    }

    const rejecteds = rejectedsByDeliveryId[deliveryId];
    if (rejecteds && rejecteds.length > 0) {
        for (const rejected of rejecteds) {
            rejectedAmount += Number(rejected.rejectedAmount || 0);
        }
    }

    return { rejectedAmount };
};

export const selectRejectedsByDeliveryAndClient = (
    state: RootState,
    deliveryId?: number | string | null,
    clientId?: number | string | null,
    fallbackClientId?: number | string | null
): IFRejected[] => {
    if (!clientId && !fallbackClientId) return [];

    const targetIds = [clientId, fallbackClientId]
        .filter((id): id is number | string => id != null)
        .map(Number);

    if (deliveryId) {
        const numDeliveryId = Number(deliveryId);
        const rejectedsByDeliveryId = selectRejectedsByDeliveryIdState(state);
        const deliveryRejecteds = rejectedsByDeliveryId?.[numDeliveryId];

        if (deliveryRejecteds && deliveryRejecteds.length > 0) {
            const matched = deliveryRejecteds.filter((r) => targetIds.includes(Number(r.clientId)));
            if (matched.length > 0) return matched;
        }
    }

    // Buscar en rejectedsByClientKey
    const rejectedsByClientKey = state.rejecteds?.rejectedsByClientKey;
    if (rejectedsByClientKey) {
        for (const id of targetIds) {
            const key = buildDeliveryClientKey(deliveryId, id);
            if (rejectedsByClientKey[key] && rejectedsByClientKey[key].length > 0) {
                return rejectedsByClientKey[key];
            }
        }
    }

    return [];
};

export const selectIsRejectedsLoading = (
    state: RootState,
    deliveryId?: number | string | null,
    clientId?: number | string | null,
    fallbackClientId?: number | string | null
): boolean => {
    if (deliveryId && selectIsRejectedsByDeliveryLoading(state, deliveryId)) {
        return true;
    }
    const loadingByClientKey = state.rejecteds?.loadingByClientKey;
    if (loadingByClientKey && (clientId || fallbackClientId)) {
        const targetIds = [clientId, fallbackClientId]
            .filter((id): id is number | string => id != null);
        for (const id of targetIds) {
            const key = buildDeliveryClientKey(deliveryId, id);
            if (loadingByClientKey[key]) {
                return true;
            }
        }
    }
    return false;
};

export const selectIsRejectedsByDeliveryLoading = (
    state: RootState,
    deliveryId?: number | string | null
): boolean => {
    if (deliveryId == null) return false;
    const loadingByDeliveryId = selectLoadingByDeliveryId(state);
    return Boolean(loadingByDeliveryId?.[Number(deliveryId)]);
};

export const selectRejectedsByDeliveryId = (
    state: RootState,
    deliveryId?: number | string | null
): IFRejected[] => {
    if (deliveryId == null) return [];
    const rejectedsByDeliveryIdState = selectRejectedsByDeliveryIdState(state);
    return rejectedsByDeliveryIdState?.[Number(deliveryId)] || [];
};

export const selectAllRejecteds = (state: RootState): IFRejected[] => {
    return state.rejecteds?.rejecteds || [];
};

export {
    selectReturnReasons,
    selectReturnReasonByCode,
    selectReturnReasonDescription,
} from '../slices/driverObserver/rejectedsSlice';

