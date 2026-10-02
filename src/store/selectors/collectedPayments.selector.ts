import type { RootState } from '../index';
import type { IFCollectedPayment, IFCollectedPaymentInvoice } from '@repo/api-contracts/firebase';

export interface ICollectedPaymentsSummary {
    paymentCollectedAmount: number;
    amountToCurrentAccount: number;
    extraAmount: number;
    cashAmount: number;
    accountAmount: number;
}

const selectPaymentsByDeliveryId = (state: RootState) => state.collectedPayments?.paymentsByDeliveryId;
const selectDeliveriesByDriverId = (state: RootState) => state.deliveries?.deliveriesByDriverId;
const selectLoadingByDeliveryId = (state: RootState) => state.collectedPayments?.loadingByDeliveryId;

const getInitialSummary = (): ICollectedPaymentsSummary => ({
    paymentCollectedAmount: 0,
    amountToCurrentAccount: 0,
    extraAmount: 0,
    cashAmount: 0,
    accountAmount: 0,
});

const accumulatePaymentsSummary = (payments: IFCollectedPayment[], summary: ICollectedPaymentsSummary) => {
    for (const payment of payments) {
        if (payment.paymentId === -1) {
            summary.amountToCurrentAccount += payment.amountToCurrentAccount || 0;
        } else {
            payment.invoices?.forEach((invoice: IFCollectedPaymentInvoice) => {
                if (invoice.isExtraInvoice) {
                    summary.extraAmount += invoice.collectedAmount || 0;
                } else if (invoice.isCurrentAccountInvoice) {
                    summary.accountAmount += invoice.collectedAmount || 0;
                } else {
                    summary.cashAmount += invoice.collectedAmount || 0;
                }
            });
            summary.paymentCollectedAmount += payment.paymentCollectedAmount || 0;
        }
    }
};

export const getCollectedPaymentsSummaryByDriverId = (state: RootState, driverId: number): ICollectedPaymentsSummary => {
    const summary = getInitialSummary();
    const paymentsByDeliveryId = selectPaymentsByDeliveryId(state);
    const deliveriesByDriverId = selectDeliveriesByDriverId(state);

    if (!paymentsByDeliveryId || !deliveriesByDriverId) {
        return summary;
    }

    const deliveries = deliveriesByDriverId[driverId];
    if (deliveries && deliveries.length > 0) {
        for (const delivery of deliveries) {
            if (delivery.id != null) {
                const payments = paymentsByDeliveryId[delivery.id];
                if (payments && payments.length > 0) {
                    accumulatePaymentsSummary(payments, summary);
                }
            }
        }
    }

    return summary;
};

export const getCollectedPaymentsSummaryByDeliveryIds = (state: RootState, deliveryIds: number[]): ICollectedPaymentsSummary => {
    const summary = getInitialSummary();
    const paymentsByDeliveryId = selectPaymentsByDeliveryId(state);

    if (!paymentsByDeliveryId) {
        return summary;
    }

    for (const deliveryId of deliveryIds) {
        const payments = paymentsByDeliveryId[deliveryId];
        if (payments && payments.length > 0) {
            accumulatePaymentsSummary(payments, summary);
        }
    }

    return summary;
};

export const getCollectedPaymentsSummaryByDeliveryId = (state: RootState, deliveryId: number): ICollectedPaymentsSummary => {
    const summary = getInitialSummary();
    const paymentsByDeliveryId = selectPaymentsByDeliveryId(state);

    if (!paymentsByDeliveryId) {
        return summary;
    }

    const payments = paymentsByDeliveryId[deliveryId];
    if (payments && payments.length > 0) {
        accumulatePaymentsSummary(payments, summary);
    }

    return summary;
};

export const selectCollectedPaymentsByDeliveryAndClient = (
    state: RootState,
    deliveryId?: number | string | null,
    clientId?: number | string | null,
    fallbackClientId?: number | string | null
): IFCollectedPayment[] => {
    if (!deliveryId || (!clientId && !fallbackClientId)) return [];

    const numDeliveryId = Number(deliveryId);
    const paymentsByDeliveryId = selectPaymentsByDeliveryId(state);
    const deliveryPayments = paymentsByDeliveryId?.[numDeliveryId];

    if (deliveryPayments && deliveryPayments.length > 0) {
        const targetIds = [clientId, fallbackClientId]
            .filter((id): id is number | string => id != null)
            .map(Number);

        const matched = deliveryPayments.filter((p) => targetIds.includes(Number(p.clientId)));
        if (matched.length > 0) return matched;
    }

    return [];
};

export const selectIsCollectedPaymentsLoading = (
    state: RootState,
    deliveryId?: number | string | null,
): boolean => {
    if (!deliveryId) return false;
    return selectIsCollectedPaymentsByDeliveryLoading(state, deliveryId);
};

export const selectIsCollectedPaymentsByDeliveryLoading = (
    state: RootState,
    deliveryId?: number | string | null
): boolean => {
    if (deliveryId == null) return false;
    const loadingByDeliveryId = selectLoadingByDeliveryId(state);
    return Boolean(loadingByDeliveryId?.[Number(deliveryId)]);
};

export const selectCollectedPaymentsByDeliveryId = (
    state: RootState,
    deliveryId?: number | string | null
): IFCollectedPayment[] => {
    if (deliveryId == null) return [];
    const paymentsByDeliveryId = selectPaymentsByDeliveryId(state);
    return paymentsByDeliveryId?.[Number(deliveryId)] || [];
};

export const selectAllCollectedPayments = (state: RootState): IFCollectedPayment[] => {
    return state.collectedPayments?.collectedPayments || [];
};
