import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { collectedPaymentsService } from '@repo/firebase-services';
import type { IFCollectedPayment } from '@repo/api-contracts/firebase';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export interface ICollectedPaymentsState {
  paymentById: Record<string | number, IFCollectedPayment>;
  paymentsByDeliveryId: Record<number, IFCollectedPayment[]>;
  collectedPayments: IFCollectedPayment[];
  loadingByDeliveryId: Record<number, boolean>;
  loading: boolean;
  error: string | null;
}

export interface IFetchCollectedPaymentsParams {
  deliveryId: number | string;
  companyId?: string | number;
  clientId?: number | string;
  forceRefresh?: boolean;
}

export interface IFetchCollectedPaymentsResponse {
  deliveryId: number;
  payments: IFCollectedPayment[];
  fromCache?: boolean;
}

export interface IClearCollectedPaymentsCachePayload {
  deliveryId: number | string;
}

const initialState: ICollectedPaymentsState = {
  paymentById: {},
  paymentsByDeliveryId: {},
  collectedPayments: [],
  loadingByDeliveryId: {},
  loading: false,
  error: null,
};

export const fetchCollectedPaymentsByDelivery = createAsyncThunk<
  IFetchCollectedPaymentsResponse,
  IFetchCollectedPaymentsParams,
  { rejectValue: string; state: RootState }
>(
  'collectedPayments/fetchCollectedPaymentsByDelivery',
  async (params, thunkAPI) => {
    const state = thunkAPI.getState();
    const numDeliveryId = Number(params.deliveryId);

    if (!params.forceRefresh && state.collectedPayments.paymentsByDeliveryId[numDeliveryId]) {
      return {
        deliveryId: numDeliveryId,
        payments: state.collectedPayments.paymentsByDeliveryId[numDeliveryId],
        fromCache: true,
      };
    }

    const enterpriseId = state.user.enterprise?.enterprise_id;
    const companyId = params.companyId != null
      ? String(params.companyId)
      : enterpriseId && enterpriseId !== -1
        ? String(enterpriseId)
        : '';

    if (!companyId) {
      return thunkAPI.rejectWithValue('No se encontró un enterprise_id / companyId válido en la sesión.');
    }

    try {
      const payments = await collectedPaymentsService.getAllByDelivery({
        companyId,
        deliveryId: numDeliveryId,
      });

      return {
        deliveryId: numDeliveryId,
        payments: payments ?? [],
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || `Error al obtener cobros para el reparto ${params.deliveryId}`
      );
    }
  }
);

export const collectedPaymentsSlice = createSlice({
  name: 'collectedPayments',
  initialState,
  reducers: {
    resetCollectedPayments: () => initialState,
    clearCollectedPaymentsCacheForDelivery(
      state,
      action: PayloadAction<IClearCollectedPaymentsCachePayload>
    ) {
      const deliveryId = Number(action.payload.deliveryId);
      delete state.paymentsByDeliveryId[deliveryId];
      delete state.loadingByDeliveryId[deliveryId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, () => initialState)
      .addCase(fetchCollectedPaymentsByDelivery.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.loadingByDeliveryId[Number(action.meta.arg.deliveryId)] = true;
      })
      .addCase(fetchCollectedPaymentsByDelivery.fulfilled, (state, action) => {
        state.loading = false;
        const { deliveryId, payments, fromCache } = action.payload;
        state.loadingByDeliveryId[deliveryId] = false;

        if (fromCache) return;

        state.paymentsByDeliveryId[deliveryId] = payments;

        const existingIds = new Set(
          state.collectedPayments
            .map((p) => p.id ?? p.paymentId)
            .filter((id): id is string | number => id != null)
        );

        for (const payment of payments) {
          const paymentKey = payment.id ?? payment.paymentId;
          if (paymentKey != null) {
            state.paymentById[paymentKey] = payment;
            if (!existingIds.has(paymentKey)) {
              existingIds.add(paymentKey);
              state.collectedPayments.push(payment);
            }
          }
        }
      })
      .addCase(fetchCollectedPaymentsByDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error desconocido al cargar los cobros del reparto';
        state.loadingByDeliveryId[Number(action.meta.arg.deliveryId)] = false;
      });
  },
});

export const {
  resetCollectedPayments,
  clearCollectedPaymentsCacheForDelivery,
} = collectedPaymentsSlice.actions;

export const selectCollectedPayments = (state: RootState) =>
  state.collectedPayments.collectedPayments;

export const selectCollectedPaymentById = (state: RootState) =>
  state.collectedPayments.paymentById;

export const selectCollectedPaymentsByDeliveryIdMap = (state: RootState) =>
  state.collectedPayments.paymentsByDeliveryId;

export const selectCollectedPaymentsLoading = (state: RootState) =>
  state.collectedPayments.loading;

export const selectCollectedPaymentsError = (state: RootState) =>
  state.collectedPayments.error;

export default collectedPaymentsSlice.reducer;
