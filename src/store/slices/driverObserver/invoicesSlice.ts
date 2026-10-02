import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { store, type RootState } from '../..';
import { invoicesService, invoicesByDateService, invoicesDetailService } from '@repo/firebase-services';
import type { IFInvoice, IFInvoiceDetail } from '@repo/api-contracts/firebase';
import moment from 'moment';
import { changeEnterprise } from '../userSlice';

export type TPdvStatus =
  | 'PARTIALLYDELIVERED'
  | 'PENDING'
  | 'DELIVERED'
  | 'REJECTED'
  | null;

export interface IInvoicesState {
  invoicesByPdvDate: Record<string, IFInvoice[]>;
  invoiceById: Record<number, IFInvoice>;
  invoicesByDeliveryId: Record<number, IFInvoice[]>;
  invoicesByOrderId: Record<number, IFInvoice[]>;
  invoices: IFInvoice[];
  invoiceDetailById: Record<number, IFInvoiceDetail>;
  invoiceDetailByInvoiceId: Record<number, IFInvoiceDetail[]>;
  loadingByPdvDate: Record<string, boolean>;
  loadingDetailByInvoiceId: Record<number, boolean>;
  loading: boolean;
  error: string | null;
}

export interface IFetchInvoicesByPdvParams {
  pdvId: number;
  date?: string;
  deliveryIds?: number | number[];
  companyId?: string | number;
  forceRefresh?: boolean;
}

export interface IFetchInvoicesByMultiplePdvsParams {
  pdvIds: number[];
  date?: string;
  deliveryIds?: number | number[];
  companyId?: string | number;
  forceRefresh?: boolean;
}

export interface IFetchInvoicesByDateParams {
  date?: string;
  companyId?: string | number;
  limit?: number;
  forceRefresh?: boolean;
}

export interface IFetchInvoiceDetailParams {
  invoiceId: number;
  companyId?: string | number;
  forceRefresh?: boolean;
}

export const buildPdvDateKey = (pdvId: number, date: string): string => `${pdvId}_${date}`;

const initialState: IInvoicesState = {
  invoicesByPdvDate: {},
  invoiceById: {},
  invoicesByDeliveryId: {},
  invoicesByOrderId: {},
  invoices: [],
  invoiceDetailById: {},
  invoiceDetailByInvoiceId: {},
  loadingByPdvDate: {},
  loadingDetailByInvoiceId: {},
  loading: false,
  error: null,
};

export const fetchInvoicesByPdv = createAsyncThunk<
  {
    key: string;
    pdvId: number;
    date: string;
    invoices: IFInvoice[];
    fromCache?: boolean;
  },
  IFetchInvoicesByPdvParams,
  { rejectValue: string; state: RootState }
>('invoices/fetchInvoicesByPdv', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const { pdvId, forceRefresh } = params;
  const { enterprise } = state.user;
  const { date: sidebarDate } = state.sidebar;

  const formattedDate = params.date
    ? moment(params.date).format('YYYY-MM-DD')
    : moment(sidebarDate).format('YYYY-MM-DD');

  const key = buildPdvDateKey(pdvId, formattedDate);

  if (!forceRefresh && state.invoices?.invoicesByPdvDate?.[key]) {
    return {
      key,
      pdvId,
      date: formattedDate,
      invoices: state.invoices.invoicesByPdvDate[key],
      fromCache: true,
    };
  }

  const companyId =
    params.companyId ??
    (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
      ? String(enterprise.enterprise_id)
      : '');

  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido.');
  }

  let targetDeliveryIds: number[] = [];

  if (params.deliveryIds !== undefined) {
    targetDeliveryIds = Array.isArray(params.deliveryIds)
      ? params.deliveryIds
      : [params.deliveryIds];
  } else {
    const clientIdsByDeliveryId = state.deliveryClients?.clientIdsByDeliveryId || {};
    targetDeliveryIds = Object.entries(clientIdsByDeliveryId)
      .filter(([_, clientIds]) => clientIds.includes(pdvId))
      .map(([deliveryIdStr]) => Number(deliveryIdStr));

    if (targetDeliveryIds.length === 0 && state.deliveries?.deliveries) {
      targetDeliveryIds = state.deliveries.deliveries.map((d) => d.id);
    }
  }

  if (targetDeliveryIds.length === 0) {
    return {
      key,
      pdvId,
      date: formattedDate,
      invoices: [],
    };
  }

  try {
    const invoicesArrays = await Promise.all(
      targetDeliveryIds.map(async (deliveryId) => {
        try {
          return await invoicesService.getAll({
            companyId,
            date: formattedDate,
            deliveryId,
            pdvId,
          });
        } catch {
          return [];
        }
      })
    );

    const uniqueInvoices: IFInvoice[] = [];
    const seenInvoiceIds = new Set<number>();

    for (const group of invoicesArrays) {
      for (const inv of group) {
        if (!seenInvoiceIds.has(inv.id)) {
          seenInvoiceIds.add(inv.id);
          uniqueInvoices.push(inv);
        }
      }
    }

    return {
      key,
      pdvId,
      date: formattedDate,
      invoices: uniqueInvoices,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || `Error al obtener facturas para el PDV ${pdvId}`);
  }
});

export const fetchInvoicesByMultiplePdvs = createAsyncThunk<
  void,
  IFetchInvoicesByMultiplePdvsParams,
  { dispatch: any }
>('invoices/fetchInvoicesByMultiplePdvs', async (params, { dispatch }) => {
  const { pdvIds, ...rest } = params;
  await Promise.all(pdvIds.map((pdvId) => dispatch(fetchInvoicesByPdv({ pdvId, ...rest }))));
});

export const fetchInvoicesByDate = createAsyncThunk<
  {
    date: string;
    companyId: string | number;
    invoices: IFInvoice[];
  },
  IFetchInvoicesByDateParams | void,
  { rejectValue: string; state: RootState }
>(
  'invoices/fetchInvoicesByDate',
  async (params, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    const { date: sidebarDate } = state.sidebar;

    const formattedDate = params?.date
      ? moment(params.date).format('YYYY-MM-DD')
      : moment(sidebarDate).format('YYYY-MM-DD');

    const companyId =
      params?.companyId ??
      (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
        ? String(enterprise.enterprise_id)
        : '');

    if (!companyId) {
      return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido.');
    }

    try {
      const invoices = await invoicesByDateService.getAll({
        companyId,
        date: formattedDate,
        limit: params?.limit,
      });

      return {
        date: formattedDate,
        companyId,
        invoices: invoices || [],
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.message || `Error al obtener facturas para la fecha ${formattedDate}`);
    }
  },
  {
    condition: (params, { getState }) => {
      if (params?.forceRefresh) return true;
      const state = getState();
      if (state.invoices?.loading) return false;
      if (state.invoices?.invoices && state.invoices.invoices.length > 0) return false;
      return true;
    },
  }
);

export const fetchInvoiceDetailById = createAsyncThunk<
  {
    invoiceId: number;
    details: IFInvoiceDetail[];
  },
  IFetchInvoiceDetailParams,
  { rejectValue: string; state: RootState }
>(
  'invoices/fetchInvoiceDetailById',
  async (params, thunkAPI) => {
    const { invoiceId } = params;
    const state = thunkAPI.getState();
    const { enterprise } = state.user;

    const companyId =
      params.companyId ??
      (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
        ? String(enterprise.enterprise_id)
        : '');

    if (!companyId) {
      return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido.');
    }

    try {
      const details = await invoicesDetailService.getByInvoiceId(companyId, invoiceId);
      return {
        invoiceId,
        details: details || [],
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.message || `Error al obtener detalle de factura ${invoiceId}`);
    }
  },
  {
    condition: (params, { getState }) => {
      const state = getState();
      const { invoiceId, forceRefresh } = params;
      if (state.invoices?.loadingDetailByInvoiceId?.[invoiceId]) return false;
      if (!forceRefresh && state.invoices?.invoiceDetailByInvoiceId?.[invoiceId] !== undefined) return false;
      return true;
    },
  }
);

export const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    resetInvoices: () => initialState,

    clearInvoicesCacheForPdv(state, action: PayloadAction<{ pdvId: number; date: string }>) {
      const key = buildPdvDateKey(action.payload.pdvId, action.payload.date);
      delete state.invoicesByPdvDate[key];
      delete state.loadingByPdvDate[key];
    },

    setInvoicesForPdvDate(
      state,
      action: PayloadAction<{ pdvId: number; date: string; invoices: IFInvoice[] }>
    ) {
      const { pdvId, date, invoices } = action.payload;
      const key = buildPdvDateKey(pdvId, date);
      state.invoicesByPdvDate[key] = invoices;

      for (const inv of invoices) {
        state.invoiceById[inv.id] = inv;

        if (inv.orderId !== undefined && inv.orderId !== null) {
          if (!state.invoicesByOrderId[inv.orderId]) {
            state.invoicesByOrderId[inv.orderId] = [];
          }
          if (!state.invoicesByOrderId[inv.orderId].some((i) => i.id === inv.id)) {
            state.invoicesByOrderId[inv.orderId].push(inv);
          }
        }

        if (!state.invoicesByDeliveryId[inv.deliveryId]) {
          state.invoicesByDeliveryId[inv.deliveryId] = [];
        }
        if (!state.invoicesByDeliveryId[inv.deliveryId].some((i) => i.id === inv.id)) {
          state.invoicesByDeliveryId[inv.deliveryId].push(inv);
        }
      }

      const existingIds = new Set(state.invoices.map((i) => i.id));
      for (const inv of invoices) {
        if (!existingIds.has(inv.id)) {
          existingIds.add(inv.id);
          state.invoices.push(inv);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(fetchInvoicesByPdv.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const pdvId = action.meta.arg.pdvId;
        const targetDate = action.meta.arg.date
          ? moment(action.meta.arg.date).format('YYYY-MM-DD')
          : '';
        if (targetDate) {
          state.loadingByPdvDate[buildPdvDateKey(pdvId, targetDate)] = true;
        }
      })
      .addCase(fetchInvoicesByPdv.fulfilled, (state, action) => {
        state.loading = false;
        const { key, invoices, fromCache } = action.payload;
        state.loadingByPdvDate[key] = false;

        if (fromCache) return;

        state.invoicesByPdvDate[key] = invoices;

        for (const inv of invoices) {
          state.invoiceById[inv.id] = inv;

          if (inv.orderId !== undefined && inv.orderId !== null) {
            if (!state.invoicesByOrderId[inv.orderId]) {
              state.invoicesByOrderId[inv.orderId] = [];
            }
            const orderList = state.invoicesByOrderId[inv.orderId];
            if (!orderList.some((existing) => existing.id === inv.id)) {
              orderList.push(inv);
            }
          }

          if (!state.invoicesByDeliveryId[inv.deliveryId]) {
            state.invoicesByDeliveryId[inv.deliveryId] = [];
          }
          const deliveryInvoices = state.invoicesByDeliveryId[inv.deliveryId];
          if (!deliveryInvoices.some((existing) => existing.id === inv.id)) {
            deliveryInvoices.push(inv);
          }
        }

        const existingIds = new Set(state.invoices.map((i) => i.id));
        for (const inv of invoices) {
          if (!existingIds.has(inv.id)) {
            existingIds.add(inv.id);
            state.invoices.push(inv);
          }
        }
      })
      .addCase(fetchInvoicesByPdv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error al cargar facturas';
        const pdvId = action.meta.arg.pdvId;
        const targetDate = action.meta.arg.date
          ? moment(action.meta.arg.date).format('YYYY-MM-DD')
          : '';
        if (targetDate) {
          state.loadingByPdvDate[buildPdvDateKey(pdvId, targetDate)] = false;
        }
      })
      .addCase(fetchInvoicesByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByDate.fulfilled, (state, action) => {
        state.loading = false;
        const { date, invoices } = action.payload;

        const existingIds = new Set(state.invoices.map((i) => i.id));
        for (const inv of invoices) {
          if (!existingIds.has(inv.id)) {
            existingIds.add(inv.id);
            state.invoices.push(inv);
          } else {
            const idx = state.invoices.findIndex((i) => i.id === inv.id);
            if (idx !== -1) {
              state.invoices[idx] = inv;
            }
          }
        }

        for (const inv of invoices) {
          state.invoiceById[inv.id] = inv;

          if (inv.orderId !== undefined && inv.orderId !== null) {
            if (!state.invoicesByOrderId[inv.orderId]) {
              state.invoicesByOrderId[inv.orderId] = [];
            }
            const orderList = state.invoicesByOrderId[inv.orderId];
            const existingOrderIdx = orderList.findIndex((i) => i.id === inv.id);
            if (existingOrderIdx >= 0) {
              orderList[existingOrderIdx] = inv;
            } else {
              orderList.push(inv);
            }
          }

          if (inv.deliveryId) {
            if (!state.invoicesByDeliveryId[inv.deliveryId]) {
              state.invoicesByDeliveryId[inv.deliveryId] = [];
            }
            const deliveryList = state.invoicesByDeliveryId[inv.deliveryId];
            const existingDeliveryIdx = deliveryList.findIndex((i) => i.id === inv.id);
            if (existingDeliveryIdx >= 0) {
              deliveryList[existingDeliveryIdx] = inv;
            } else {
              deliveryList.push(inv);
            }
          }

          const invDate = inv.date ? moment(inv.date).format('YYYY-MM-DD') : date;
          if (inv.pdvId) {
            const pdvKey = buildPdvDateKey(inv.pdvId, invDate);
            if (!state.invoicesByPdvDate[pdvKey]) {
              state.invoicesByPdvDate[pdvKey] = [];
            }
            const pdvList = state.invoicesByPdvDate[pdvKey];
            const existingPdvIdx = pdvList.findIndex((i) => i.id === inv.id);
            if (existingPdvIdx >= 0) {
              pdvList[existingPdvIdx] = inv;
            } else {
              pdvList.push(inv);
            }
          }
        }
      })
      .addCase(fetchInvoicesByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error al obtener facturas por fecha';
      })
      .addCase(fetchInvoiceDetailById.pending, (state, action) => {
        const invoiceId = action.meta.arg.invoiceId;
        state.loadingDetailByInvoiceId[invoiceId] = true;
      })
      .addCase(fetchInvoiceDetailById.fulfilled, (state, action) => {
        const { invoiceId, details } = action.payload;
        state.loadingDetailByInvoiceId[invoiceId] = false;
        state.invoiceDetailByInvoiceId[invoiceId] = details ?? [];
        for (const item of details ?? []) {
          if (item && item.id !== undefined) {
            state.invoiceDetailById[item.id] = item;
          }
        }
      })
      .addCase(fetchInvoiceDetailById.rejected, (state, action) => {
        if (action.meta.condition) return;
        const invoiceId = action.meta.arg.invoiceId;
        state.loadingDetailByInvoiceId[invoiceId] = false;
        if (state.invoiceDetailByInvoiceId[invoiceId] === undefined) {
          state.invoiceDetailByInvoiceId[invoiceId] = [];
        }
        state.error = action.payload ?? `Error al cargar detalle de factura ${invoiceId}`;
      });
  },
});

export const { resetInvoices, clearInvoicesCacheForPdv, setInvoicesForPdvDate } = invoicesSlice.actions;

export const selectInvoicesByPdvAndDate = (
  state: RootState,
  pdvId: number,
  date?: string
): IFInvoice[] => {
  const targetDate = date
    ? moment(date).format('YYYY-MM-DD')
    : moment(state.sidebar.date).format('YYYY-MM-DD');
  return state.invoices?.invoicesByPdvDate?.[buildPdvDateKey(pdvId, targetDate)] || [];
};

export const selectIsInvoicesLoadingForPdv = (
  state: RootState,
  pdvId: number,
  date?: string
): boolean => {
  const targetDate = date
    ? moment(date).format('YYYY-MM-DD')
    : moment(state.sidebar.date).format('YYYY-MM-DD');
  return Boolean(state.invoices?.loadingByPdvDate?.[buildPdvDateKey(pdvId, targetDate)]);
};

export const selectInvoiceById = (state: RootState, invoiceId: number): IFInvoice | undefined =>
  state.invoices?.invoiceById?.[invoiceId];

export const selectInvoicesByDeliveryId = (state: RootState, deliveryId: number): IFInvoice[] =>
  state.invoices?.invoicesByDeliveryId?.[deliveryId] || [];

export const selectInvoicesByOrderId = (state: RootState, orderId: number): IFInvoice[] =>
  state.invoices?.invoicesByOrderId?.[orderId] || [];

export const selectAllInvoices = (state: RootState): IFInvoice[] => state.invoices?.invoices || [];

export const selectInvoiceDetailByInvoiceId = (
  state: RootState,
  invoiceId: number
): IFInvoiceDetail[] | undefined => state.invoices?.invoiceDetailByInvoiceId?.[invoiceId];

export const selectInvoiceDetailById = (
  state: RootState,
  detailId: number
): IFInvoiceDetail | undefined => state.invoices?.invoiceDetailById?.[detailId];

export const selectIsInvoiceDetailLoading = (state: RootState, invoiceId: number): boolean =>
  Boolean(state.invoices?.loadingDetailByInvoiceId?.[invoiceId]);

export const evaluatePdvStatus = (
  pdvId: number,
  date: string | Date,
  state?: RootState
): TPdvStatus => {
  const currentState = state ?? store?.getState?.();
  if (!currentState) return null;

  const formattedDate = moment(date).format('YYYY-MM-DD');
  const key = buildPdvDateKey(pdvId, formattedDate);
  let invoices = currentState.invoices?.invoicesByPdvDate?.[key] || [];

  if (invoices.length === 0 && currentState.invoices?.invoices) {
    invoices = currentState.invoices.invoices.filter(
      (inv: IFInvoice) => inv.pdvId === pdvId && moment(inv.date).format('YYYY-MM-DD') === formattedDate
    );
  }

  if (!invoices || invoices.length === 0) return null;

  const statuses = invoices.map((inv: IFInvoice) =>
    (inv.statusDelivered ?? (inv as any).status_delivered ?? inv.status ?? '').toUpperCase().trim()
  );

  const isPartiallyDelivered = (s: string) =>
    s === 'PARTIALLYDELIVERED' || s === 'PARTIALLY_DELIVERED' || s === 'PARTIALLY DELIVERED';

  const isTransitionOrPending = (s: string) =>
    s === 'TRANSITION' || s === 'IN_TRANSITION' || s === 'INTRANSITION' || s === 'PENDING';

  const isDelivered = (s: string) =>
    s === 'DELIVERED';

  const isRejected = (s: string) =>
    s === 'REJECTED';

  if (statuses.some(isPartiallyDelivered)) {
    return 'PARTIALLYDELIVERED';
  }

  if (statuses.every(isDelivered)) {
    return 'DELIVERED';
  }

  if (statuses.every(isRejected)) {
    return 'REJECTED';
  }

  if (statuses.every(isTransitionOrPending)) {
    return 'PENDING';
  }

  const hasRejected = statuses.some(isRejected);
  const hasDelivered = statuses.some(isDelivered);
  const hasTransitionOrPending = statuses.some(isTransitionOrPending);

  if (hasRejected && hasDelivered) {
    return 'PARTIALLYDELIVERED';
  }

  if (hasDelivered && hasTransitionOrPending) {
    return 'PARTIALLYDELIVERED';
  }

  if (hasRejected && hasTransitionOrPending) {
    return 'PARTIALLYDELIVERED';
  }

  return null;
};

export const selectPdvStatus = (
  state: RootState,
  pdvId: number,
  date: string | Date
): TPdvStatus => evaluatePdvStatus(pdvId, date, state);

export default invoicesSlice.reducer;
