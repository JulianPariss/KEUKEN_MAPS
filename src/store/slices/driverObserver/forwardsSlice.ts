import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { forwardsService } from '@repo/firebase-services';
import type { IFForward } from '@repo/api-contracts/firebase';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export interface IForwardsState {
  forwardById: Record<string | number, IFForward>;
  forwardsByDeliveryId: Record<number, IFForward[]>;
  allFetchedByDeliveryId: Record<number, boolean>;
  forwardsByClientKey: Record<string, IFForward[]>;
  loadingByClientKey: Record<string, boolean>;
  loadingByDeliveryId: Record<number, boolean>;
  forwards: IFForward[];
  loading: boolean;
  error: string | null;
}

export interface IFetchForwardsByDeliveryParams {
  deliveryId: number;
  companyId?: string | number;
  forceRefresh?: boolean;
}

export interface IFetchForwardsByClientParams {
  clientId: number;
  deliveryId?: number;
  fallbackClientId?: number;
  companyId?: string | number;
  forceRefresh?: boolean;
}

export const buildForwardClientKey = (
  deliveryId: number | string | undefined | null,
  clientId: number | string
): string =>
  deliveryId != null && deliveryId !== '' ? `${deliveryId}_${clientId}` : String(clientId);

const initialState: IForwardsState = {
  forwardById: {},
  forwardsByDeliveryId: {},
  allFetchedByDeliveryId: {},
  forwardsByClientKey: {},
  loadingByClientKey: {},
  loadingByDeliveryId: {},
  forwards: [],
  loading: false,
  error: null,
};

const resolveCompanyId = (
  state: RootState,
  companyId?: string | number
): string => {
  if (companyId != null && companyId !== '') return String(companyId);
  const enterpriseId = state.user.enterprise?.enterprise_id;
  return enterpriseId && enterpriseId !== -1 ? String(enterpriseId) : '';
};

const upsertForwards = (state: IForwardsState, items: IFForward[]) => {
  for (const item of items) {
    const id = item.id ?? `${item.deliveryId}_${item.clientId}_${item.forwardedAmount}`;
    state.forwardById[id] = item;

    if (!state.forwards.some((f) => (f.id ?? '') === id)) {
      state.forwards.push(item);
    } else {
      const idx = state.forwards.findIndex((f) => (f.id ?? '') === id);
      if (idx >= 0) state.forwards[idx] = item;
    }

    const dId = Number(item.deliveryId);
    if (!state.forwardsByDeliveryId[dId]) {
      state.forwardsByDeliveryId[dId] = [];
    }
    const deliveryList = state.forwardsByDeliveryId[dId];
    const dIdx = deliveryList.findIndex((f) => (f.id ?? '') === id);
    if (dIdx >= 0) deliveryList[dIdx] = item;
    else deliveryList.push(item);
  }
};

export const fetchForwardsByDelivery = createAsyncThunk<
  { deliveryId: number; forwards: IFForward[]; fromCache?: boolean },
  IFetchForwardsByDeliveryParams,
  { rejectValue: string; state: RootState }
>('forwards/fetchForwardsByDelivery', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const { deliveryId, forceRefresh } = params;

  if (!forceRefresh && state.forwards?.allFetchedByDeliveryId?.[deliveryId]) {
    return {
      deliveryId,
      forwards: state.forwards.forwardsByDeliveryId[deliveryId] || [],
      fromCache: true,
    };
  }

  const companyId = resolveCompanyId(state, params.companyId);
  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido en la sesión.');
  }

  try {
    const items = await forwardsService.getAllByDelivery({ companyId, deliveryId });
    return { deliveryId, forwards: items || [] };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || `Error al obtener reprogramaciones del reparto ${deliveryId}`
    );
  }
});

export const fetchForwardsByClient = createAsyncThunk<
  {
    key: string;
    deliveryId?: number;
    clientId: number;
    forwards: IFForward[];
    fromCache?: boolean;
  },
  IFetchForwardsByClientParams,
  { rejectValue: string; state: RootState }
>('forwards/fetchForwardsByClient', async (params, thunkAPI) => {
  const state = thunkAPI.getState();
  const { deliveryId, clientId, fallbackClientId, forceRefresh } = params;
  const key = buildForwardClientKey(deliveryId, clientId);

  if (!forceRefresh && state.forwards?.forwardsByClientKey?.[key]) {
    return {
      key,
      deliveryId,
      clientId,
      forwards: state.forwards.forwardsByClientKey[key],
      fromCache: true,
    };
  }

  const companyId = resolveCompanyId(state, params.companyId);
  if (!companyId) {
    return thunkAPI.rejectWithValue('No se encontró un enterprise_id válido en la sesión.');
  }

  try {
    let items = await forwardsService.getByDeliveryAndClient({
      companyId,
      clientId,
      deliveryId,
    });

    if (
      (!items || items.length === 0) &&
      fallbackClientId != null &&
      Number(fallbackClientId) !== Number(clientId)
    ) {
      items = await forwardsService.getByDeliveryAndClient({
        companyId,
        clientId: fallbackClientId,
        deliveryId,
      });
    }

    return {
      key,
      deliveryId,
      clientId,
      forwards: items || [],
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || `Error al obtener reprogramaciones del cliente ${clientId}`
    );
  }
});

export const forwardsSlice = createSlice({
  name: 'forwards',
  initialState,
  reducers: {
    resetForwards: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, () => initialState)
      .addCase(fetchForwardsByDelivery.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.loadingByDeliveryId[Number(action.meta.arg.deliveryId)] = true;
      })
      .addCase(fetchForwardsByDelivery.fulfilled, (state, action) => {
        state.loading = false;
        const { deliveryId, forwards, fromCache } = action.payload;
        state.loadingByDeliveryId[deliveryId] = false;
        state.allFetchedByDeliveryId[deliveryId] = true;
        if (!fromCache) {
          state.forwardsByDeliveryId[deliveryId] = forwards;
          upsertForwards(state, forwards);
        }
      })
      .addCase(fetchForwardsByDelivery.rejected, (state, action) => {
        state.loading = false;
        state.loadingByDeliveryId[Number(action.meta.arg.deliveryId)] = false;
        state.error = action.payload ?? 'Error al cargar reprogramaciones';
      })
      .addCase(fetchForwardsByClient.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const key = buildForwardClientKey(
          action.meta.arg.deliveryId,
          action.meta.arg.clientId
        );
        state.loadingByClientKey[key] = true;
      })
      .addCase(fetchForwardsByClient.fulfilled, (state, action) => {
        state.loading = false;
        const { key, forwards, fromCache } = action.payload;
        state.loadingByClientKey[key] = false;
        if (!fromCache) {
          state.forwardsByClientKey[key] = forwards;
          upsertForwards(state, forwards);
        }
      })
      .addCase(fetchForwardsByClient.rejected, (state, action) => {
        state.loading = false;
        const key = buildForwardClientKey(
          action.meta.arg.deliveryId,
          action.meta.arg.clientId
        );
        state.loadingByClientKey[key] = false;
        state.error = action.payload ?? 'Error al cargar reprogramaciones';
      });
  },
});

export const { resetForwards } = forwardsSlice.actions;

export const selectForwardsByClientKey = (
  state: RootState,
  deliveryId: number | string | undefined | null,
  clientId: number | string,
  fallbackClientId?: number | string | null
): IFForward[] => {
  const keys = [
    buildForwardClientKey(deliveryId, clientId),
    fallbackClientId != null
      ? buildForwardClientKey(deliveryId, fallbackClientId)
      : null,
  ].filter(Boolean) as string[];

  for (const key of keys) {
    const list = state.forwards?.forwardsByClientKey?.[key];
    if (list && list.length > 0) return list;
  }
  return [];
};

export const selectIsForwardsLoadingByClient = (
  state: RootState,
  deliveryId: number | string | undefined | null,
  clientId: number | string,
  fallbackClientId?: number | string | null
): boolean => {
  const keys = [
    buildForwardClientKey(deliveryId, clientId),
    fallbackClientId != null
      ? buildForwardClientKey(deliveryId, fallbackClientId)
      : null,
  ].filter(Boolean) as string[];

  return keys.some((key) => Boolean(state.forwards?.loadingByClientKey?.[key]));
};

export const selectForwardsByDeliveryId = (
  state: RootState,
  deliveryId: number
): IFForward[] => state.forwards?.forwardsByDeliveryId?.[deliveryId] || [];

export default forwardsSlice.reducer;
