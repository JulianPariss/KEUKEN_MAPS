import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { rejectedsService } from '@repo/firebase-services';
import type { IFRejected, IFRejectReason } from '@repo/api-contracts/firebase';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export interface IRejectedsState {
  rejectedById: Record<string | number, IFRejected>;
  rejectedsByDeliveryId: Record<number, IFRejected[]>;
  allFetchedByDeliveryId: Record<number, boolean>;
  rejectedsByClientKey: Record<string, IFRejected[]>;
  loadingByClientKey: Record<string, boolean>;
  rejecteds: IFRejected[];
  loadingByDeliveryId: Record<number, boolean>;
  returnReasons: Record<string, IFRejectReason>;
  returnReasonsLoading: boolean;
  loading: boolean;
  error: string | null;
}

export interface IFetchRejectedsByDeliveryParams {
  deliveryId: number;
  companyId?: string | number;
  forceRefresh?: boolean;
}

export interface IFetchRejectedsByClientParams {
  clientId: number;
  deliveryId?: number;
  fallbackClientId?: number;
  companyId?: string | number;
  forceRefresh?: boolean;
}

export interface IFetchReturnReasonsParams {
  companyId?: string | number;
  forceRefresh?: boolean;
}

export const buildDeliveryClientKey = (
  deliveryId: number | string | undefined | null,
  clientId: number | string
): string => (deliveryId != null && deliveryId !== '' ? `${deliveryId}_${clientId}` : String(clientId));

const initialState: IRejectedsState = {
  rejectedById: {},
  rejectedsByDeliveryId: {},
  allFetchedByDeliveryId: {},
  rejectedsByClientKey: {},
  loadingByClientKey: {},
  rejecteds: [],
  loadingByDeliveryId: {},
  returnReasons: {},
  returnReasonsLoading: false,
  loading: false,
  error: null,
};

export const fetchRejectedsByDelivery = createAsyncThunk<
  {
    deliveryId: number;
    rejecteds: IFRejected[];
    fromCache?: boolean;
  },
  IFetchRejectedsByDeliveryParams,
  { rejectValue: string; state: RootState }
>('rejecteds/fetchRejectedsByDelivery', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const { deliveryId, forceRefresh } = params;

  if (!forceRefresh && state.rejecteds?.allFetchedByDeliveryId?.[deliveryId]) {
    return {
      deliveryId,
      rejecteds: state.rejecteds.rejectedsByDeliveryId[deliveryId] || [],
      fromCache: true,
    };
  }

  const { enterprise } = state.user;
  const companyId =
    params.companyId ??
    (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
      ? String(enterprise.enterprise_id)
      : '');

  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido en la sesión.');
  }

  try {
    const items = await rejectedsService.getAllByDelivery({
      companyId,
      deliveryId,
    });

    return {
      deliveryId,
      rejecteds: items || [],
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || `Error al obtener devoluciones para el reparto ${deliveryId}`
    );
  }
});

export const fetchRejectedsByClient = createAsyncThunk<
  {
    key: string;
    deliveryId?: number;
    clientId: number;
    rejecteds: IFRejected[];
    fromCache?: boolean;
  },
  IFetchRejectedsByClientParams,
  { rejectValue: string; state: RootState }
>('rejecteds/fetchRejectedsByClient', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const { deliveryId, clientId, fallbackClientId, forceRefresh } = params;
  const key = buildDeliveryClientKey(deliveryId, clientId);

  if (!forceRefresh && deliveryId != null && state.rejecteds?.allFetchedByDeliveryId?.[deliveryId]) {
    const deliveryRejecteds = state.rejecteds.rejectedsByDeliveryId[deliveryId] || [];
    const targetIds = [clientId, fallbackClientId].filter((id): id is number => id != null);
    const filtered = deliveryRejecteds.filter((r) => targetIds.includes(Number(r.clientId)));
    return {
      key,
      deliveryId,
      clientId,
      rejecteds: filtered,
      fromCache: true,
    };
  }

  if (!forceRefresh && state.rejecteds?.rejectedsByClientKey?.[key]) {
    return {
      key,
      deliveryId,
      clientId,
      rejecteds: state.rejecteds.rejectedsByClientKey[key],
      fromCache: true,
    };
  }

  const { enterprise } = state.user;
  const companyId =
    params.companyId ??
    (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
      ? String(enterprise.enterprise_id)
      : '');

  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido en la sesión.');
  }

  try {
    const items = await rejectedsService.getByDeliveryAndClient({
      companyId,
      deliveryId,
      clientId,
    });

    return {
      key,
      deliveryId,
      clientId,
      rejecteds: items || [],
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || `Error al obtener devoluciones para el cliente ${clientId}`
    );
  }
});

export const fetchReturnReasons = createAsyncThunk<
  Record<string, IFRejectReason>,
  IFetchReturnReasonsParams | void,
  { rejectValue: string; state: RootState }
>('rejecteds/fetchReturnReasons', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const forceRefresh = params?.forceRefresh ?? false;

  if (!forceRefresh && Object.keys(state.rejecteds?.returnReasons || {}).length > 0) {
    return state.rejecteds.returnReasons;
  }

  const { enterprise } = state.user;
  const companyId =
    params?.companyId ??
    (enterprise?.enterprise_id && enterprise.enterprise_id !== -1
      ? String(enterprise.enterprise_id)
      : '');

  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido en la sesión.');
  }

  try {
    const items = await rejectedsService.getReturnReasons(companyId);
    const reasonsMap: Record<string, IFRejectReason> = {};
    for (const item of items) {
      if (item.code) {
        reasonsMap[item.code] = item;
      }
    }
    return reasonsMap;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || 'Error al obtener motivos de devolución');
  }
});

export const rejectedsSlice = createSlice({
  name: 'rejecteds',
  initialState,
  reducers: {
    resetRejecteds: () => initialState,

    clearRejectedsCacheForDelivery(state, action: PayloadAction<{ deliveryId: number }>) {
      const { deliveryId } = action.payload;
      delete state.rejectedsByDeliveryId[deliveryId];
      delete state.allFetchedByDeliveryId[deliveryId];
      delete state.loadingByDeliveryId[deliveryId];
    },

    clearRejectedsCacheForClient(
      state,
      action: PayloadAction<{ deliveryId?: number; clientId: number }>
    ) {
      const key = buildDeliveryClientKey(action.payload.deliveryId, action.payload.clientId);
      delete state.rejectedsByClientKey[key];
      delete state.loadingByClientKey[key];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, (state) => ({
        ...initialState,
        returnReasons: state.returnReasons,
        returnReasonsLoading: false,
      }))
      .addCase(fetchRejectedsByDelivery.pending, (state, action) => {
        if (!action.meta.arg.forceRefresh && state.allFetchedByDeliveryId[action.meta.arg.deliveryId]) {
          return;
        }
        state.loading = true;
        state.error = null;
        state.loadingByDeliveryId[action.meta.arg.deliveryId] = true;
      })
      .addCase(fetchRejectedsByDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { deliveryId, rejecteds, fromCache } = action.payload;
        state.loadingByDeliveryId[deliveryId] = false;

        if (fromCache) return;

        state.rejectedsByDeliveryId[deliveryId] = rejecteds;
        state.allFetchedByDeliveryId[deliveryId] = true;

        for (const rejected of rejecteds) {
          if (rejected.id != null) {
            state.rejectedById[rejected.id] = rejected;
          }
          if (rejected.clientId != null) {
            const key = buildDeliveryClientKey(deliveryId, rejected.clientId);
            if (!state.rejectedsByClientKey[key]) {
              state.rejectedsByClientKey[key] = [];
            }
            if (!state.rejectedsByClientKey[key].some((r) => r.id === rejected.id)) {
              state.rejectedsByClientKey[key].push(rejected);
            }
          }
        }

        const existingIds = new Set(state.rejecteds.map((p) => p.id).filter(Boolean));
        for (const rejected of rejecteds) {
          if (rejected.id != null && !existingIds.has(rejected.id)) {
            existingIds.add(rejected.id);
            state.rejecteds.push(rejected);
          }
        }
      })
      .addCase(fetchRejectedsByDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error al cargar devoluciones del reparto';
        state.loadingByDeliveryId[action.meta.arg.deliveryId] = false;
      })
      .addCase(fetchRejectedsByClient.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const key = buildDeliveryClientKey(action.meta.arg.deliveryId, action.meta.arg.clientId);
        state.loadingByClientKey[key] = true;
      })
      .addCase(fetchRejectedsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { key, deliveryId, rejecteds, fromCache } = action.payload;
        state.loadingByClientKey[key] = false;

        if (fromCache) return;

        state.rejectedsByClientKey[key] = rejecteds;

        if (deliveryId != null) {
          if (!state.rejectedsByDeliveryId[deliveryId]) {
            state.rejectedsByDeliveryId[deliveryId] = [];
          }
          const list = state.rejectedsByDeliveryId[deliveryId];
          for (const item of rejecteds) {
            if (item.id != null && !list.some((existing) => existing.id === item.id)) {
              list.push(item);
            }
          }
        }

        for (const item of rejecteds) {
          if (item.id != null) {
            state.rejectedById[item.id] = item;
          }
        }

        const existingIds = new Set(state.rejecteds.map((p) => p.id).filter(Boolean));
        for (const item of rejecteds) {
          if (item.id != null && !existingIds.has(item.id)) {
            existingIds.add(item.id);
            state.rejecteds.push(item);
          }
        }
      })
      .addCase(fetchRejectedsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error al cargar devoluciones del cliente';
        const key = buildDeliveryClientKey(action.meta.arg.deliveryId, action.meta.arg.clientId);
        state.loadingByClientKey[key] = false;
      })
      .addCase(fetchReturnReasons.pending, (state) => {
        state.returnReasonsLoading = true;
      })
      .addCase(fetchReturnReasons.fulfilled, (state, action) => {
        state.returnReasonsLoading = false;
        state.returnReasons = action.payload;
      })
      .addCase(fetchReturnReasons.rejected, (state) => {
        state.returnReasonsLoading = false;
      });
  },
});

export const {
  resetRejecteds,
  clearRejectedsCacheForDelivery,
  clearRejectedsCacheForClient,
} = rejectedsSlice.actions;

export const selectRejecteds = (state: RootState): IFRejected[] => state.rejecteds.rejecteds;
export const selectRejectedById = (state: RootState): Record<string | number, IFRejected> =>
  state.rejecteds.rejectedById;
export const selectRejectedsByDeliveryIdMap = (state: RootState): Record<number, IFRejected[]> =>
  state.rejecteds.rejectedsByDeliveryId;
export const selectRejectedsByClientKeyMap = (state: RootState): Record<string, IFRejected[]> =>
  state.rejecteds.rejectedsByClientKey;
export const selectReturnReasons = (state: RootState): Record<string, IFRejectReason> =>
  state.rejecteds?.returnReasons || {};
export const selectReturnReasonByCode = (
  state: RootState,
  code?: string | null
): IFRejectReason | undefined => (code ? state.rejecteds?.returnReasons?.[code] : undefined);
export const selectReturnReasonDescription = (
  state: RootState,
  code?: string | null
): string => {
  if (!code) return '';
  return state.rejecteds?.returnReasons?.[code]?.description || code;
};

export default rejectedsSlice.reducer;
