import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type ISellerState, type ISeller, type IRoute, type TConnectionStatus, type TNestedRoutes, type IGps, type IUISeller } from '../../../utils/types/sellerObserver/sellers.types';
import { getAllSellers } from '../../../services/sellers.service';
import { getGpsRecord, getRouteHistoryByPhone } from '../../../services/locations.service';
import moment from 'moment';
import type { RootState } from '../..';
import { fetchAllOrders } from '../../sharedThunks';
import { indexToColor } from '@repo/map-core';
import { notify } from '../../../utils/helpers/messageHelper';
import { isAbortError } from '../../../services';

const initialState: ISellerState = {
  sellers: [],
  sellerById: {},
  sellersUI: {},
  watchList: [],
  filterList: [],
  onlineStatus: [],
  sellerRoutes: {
    routes: {},
    loading: false,
    error: undefined
  },
  sellerOrders: {
    orders: {},
    loading: false,
    error: undefined,
  },
  sellerGps: {
    gps: {},
    loading: false,
    error: undefined
  },
  animation: {
    isAnimating: false,
    sellerAnimated: null,
  },
  loading: true,
  error: null,
};

export const fetchSellers = createAsyncThunk<{ sellers: ISeller[] }, { enterprise_id: number, routeDate: string }, { rejectValue: string }>(
  'sellers/fetchSellers',
  async (params, thunkAPI) => {
    try {
      const response = await getAllSellers(params.enterprise_id, params.routeDate);
      return {
        sellers: response,
      };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar los vendedores', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch sellers');
    }
  }
);

export const fetchAllLocationHistory = createAsyncThunk<{ routes: TNestedRoutes | {} }, {}, { rejectValue: string, state: RootState }>(
  'locations/fetchHistory',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const sellerState = state.sellers;
    const { enterprise } = state.user;
    const { date } = state.sidebar;

    try {
      const sellerRoutes = await Promise.all(
        sellerState.sellers.map(async (seller) => {
          const parsedData = {
            mobileUser: seller.seller,
            enterprise_id: enterprise.enterprise_id,
            fecha_inicio: moment(date).format('YYYY-MM-DD').toString(),
          }
          try {
            const response = await getRouteHistoryByPhone(parsedData);
            return { [seller.seller]: { ...response } }
          } catch {
            return { [seller.seller]: {} }
          }
        })
      )

      const combinedRoutes = sellerRoutes.reduce((acc, item) => {
        return { ...acc, ...item };
      }, {} as TNestedRoutes);

      return { routes: combinedRoutes };
    } catch (error: any) {
      notify(error?.detail ?? 'Ocurrió un error al buscar las últimas ubicaciones de los vendedores', 'ERROR')
      return thunkAPI.rejectWithValue('Failed to fetch location history');
    }
  }
)

export const fetchGps = createAsyncThunk<{ Gps: IGps[] }, {}, { rejectValue: string, state: RootState }>(
  'locations/fetchGps',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    const { date } = state.sidebar;
    try {
      const response = await getGpsRecord(enterprise.enterprise_id, moment(date).format('YYYY-MM-DD').toString())
      return { Gps: response };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }
      notify(error?.detail ?? 'Ocurrió un error al buscar el estado del GPS de los vendedores', 'ERROR')
      return thunkAPI.rejectWithValue('Failed to fetch location history');
    }
  }
)

const toggleAllVisibility = (visibility: boolean, sellers: ISeller[]): number[] => {
  let wl: number[] = [];
  if (visibility) {
    wl = sellers.map((seller) => seller.seller);
  }
  return wl;
}

const toggleOneVisibility = (id: number, watchList: number[]) => {
  const indx = watchList.indexOf(id);
  let wl: number[];
  if (indx >= 0) {
    wl = [
      ...watchList.slice(0, indx),
      ...watchList.slice(indx + 1)
    ];
  } else {
    wl = [...watchList, id];
  }
  return wl;
}


const toggleFocus = (id: number, watchList: number[], sellers: ISeller[]): number[] => {
  if (isFocussed(id, watchList)) {
    return toggleAllVisibility(true, sellers);
  } else {
    const nWatchList = toggleAllVisibility(false, sellers);
    return toggleOneVisibility(id, nWatchList);
  }
}

export const isFocussed = (id: number, watchList: number[]): boolean => {
  return watchList.length == 1 && watchList.includes(id);
}

const sellersSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    resetSeller: () => initialState,
    changeOneVisibility(state, action: PayloadAction<number>) {
      state.watchList = toggleOneVisibility(action.payload, state.watchList);
    },
    changeAllVisibility(state, action: PayloadAction<boolean>) {
      state.watchList = toggleAllVisibility(action.payload, state.sellers);
    },
    changeWatchedList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },

    changeOneFilter(state, action: PayloadAction<number>) {
      state.filterList = toggleOneVisibility(action.payload, state.filterList);
    },
    changeAllFilter(state, action: PayloadAction<boolean>) {
      state.filterList = toggleAllVisibility(action.payload, state.sellers);
    },
    changeFilteredList(state, action: PayloadAction<number[]>) {
      state.filterList = action.payload;
    },
    changeFocus(state, action: PayloadAction<number>) {
      state.watchList = toggleFocus(action.payload, state.watchList, state.sellers);
    },
    changeSellerColor(state, action: PayloadAction<{ sellerId: number; color: string }>) {
      const { sellerId, color } = action.payload;
      if (state.sellerById[sellerId]) {
        state.sellersUI[sellerId].color = color;
      }
    },
    setOnlineStatus(
      state,
      action: PayloadAction<{ sellerId: string | number; status: 'online' | 'offline' }>
    ) {
      const id = Number(action.payload.sellerId)
      if (state.onlineStatus[id]) {
        state.onlineStatus[id] = action.payload.status;
      }
    },
    addRoutePoint(state, action: PayloadAction<{ id: number, subId: string, point: IRoute }>) {
      const { id, subId, point } = action.payload;

      if (id == null) return;

      if (!state.sellerRoutes.routes[id]) {
        state.sellerRoutes.routes[id] = {} as any;
      }

      if (!state.sellerRoutes.routes[id][subId]) {
        state.sellerRoutes.routes[id][subId] = [];
      }

      state.sellerRoutes.routes[id][subId].push(point);
    },
    setIsAnimating(state, action: PayloadAction<{ isAnimating: boolean, sellerAnimated: number | null }>) {
      state.animation = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSellers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload.sellers;
        state.onlineStatus = action.payload.sellers.reduce<{ [key: number]: TConnectionStatus }>((acc, val) => {
          acc[val.seller] = 'unknow';
          return acc;
        }, {})

        state.sellerById = action.payload.sellers.reduce<{ [key: number]: ISeller }>((acc, val) => {
          acc[val.seller] = val;
          return acc;
        }, {})

        state.sellersUI = action.payload.sellers.reduce<{ [key: number]: IUISeller }>((acc, val) => {
          acc[val.seller] = {
            color: val.color ?? indexToColor(val.seller)
          }
          return acc;
        }, {})

      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.loading = false;
        state.sellers = [];
        state.sellerById = {};
        state.sellersUI = {};
        state.onlineStatus = [];
        state.watchList = [];
        state.sellerRoutes.routes = {};
        state.sellerOrders.orders = {};
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(fetchAllLocationHistory.fulfilled, (state, action) => {
        state.sellerRoutes.routes = action.payload.routes;
      })
      .addCase(fetchAllLocationHistory.rejected, (state) => {
        state.sellerRoutes.routes = {};
      })
      .addCase(fetchAllOrders.pending, state => {
        state.sellerOrders.loading = true;
      })
      .addCase(fetchAllOrders.rejected, state => {
        state.sellerOrders.loading = false;
        state.sellerOrders.orders = {};
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.sellerOrders.orders = action.payload.sellerOrders;
        state.sellerOrders.loading = false;
      })
      .addCase(fetchGps.pending, (state) => {
        state.sellerGps.loading = true;
      })
      .addCase(fetchGps.fulfilled, (state, action) => {
        state.sellerGps.loading = false;
        state.sellerGps.gps = action.payload.Gps.reduce((acc: Record<number, IGps[]>, value) => {
          if (!acc[value.mobileUser]) {
            acc[value.mobileUser] = [];
          }
          acc[value.mobileUser].push(value);
          return acc;
        }, {});

      })
      .addCase(fetchGps.rejected, (state, action) => {
        state.sellerGps.loading = false;
        state.sellerGps.gps = {};
        state.sellerGps.error = action.error ?? 'Unknown error';
      })
  },
});

export const {
  changeOneVisibility,
  changeAllVisibility,
  setOnlineStatus,
  changeFocus,
  addRoutePoint,
  setIsAnimating,
  changeSellerColor,
  changeWatchedList,
  changeAllFilter,
  changeFilteredList,
  changeOneFilter,
  resetSeller
} = sellersSlice.actions;
export default sellersSlice.reducer;
