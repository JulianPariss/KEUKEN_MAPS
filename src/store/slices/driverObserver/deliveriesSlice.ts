import { createAsyncThunk, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { deliverieService } from '@repo/firebase-services';
import type { IFDeliverie } from '@repo/api-contracts/firebase';
import moment from 'moment';
import { getVisibilityState } from '../../../utils/helpers/visibility';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export interface IDeliveriesState {
  deliveries: IFDeliverie[];
  deliveryById: Record<number, IFDeliverie>;
  deliveriesByDriverId: Record<number, IFDeliverie[]>;
  watchList: number[];
  loading: boolean;
  error: string | null;
}

export interface IFetchDeliveriesResponse {
  deliveries: IFDeliverie[];
  deliveryById: Record<number, IFDeliverie>;
  deliveriesByDriverId: Record<number, IFDeliverie[]>;
}

export interface IChangeDriverDeliveriesVisibilityPayload {
  driverId: number;
  visibility: boolean;
}

const initialState: IDeliveriesState = {
  deliveries: [],
  deliveryById: {},
  deliveriesByDriverId: {},
  watchList: [],
  loading: false,
  error: null,
};

const toggleAllVisibility = (visibility: boolean, deliveries: IFDeliverie[]): number[] =>
  visibility ? deliveries.map((delivery) => delivery.id) : [];

const toggleOneVisibility = (id: number, watchList: number[]): number[] => {
  const index = watchList.indexOf(id);
  return index >= 0
    ? [...watchList.slice(0, index), ...watchList.slice(index + 1)]
    : [...watchList, id];
};

export const isDeliveryFocussed = (id: number, watchList: number[]): boolean =>
  watchList.length === 1 && watchList.includes(id);

const toggleFocus = (id: number, watchList: number[], deliveries: IFDeliverie[]): number[] =>
  isDeliveryFocussed(id, watchList) ? toggleAllVisibility(true, deliveries) : [id];

export const fetchDeliveriesByDrivers = createAsyncThunk<
  IFetchDeliveriesResponse,
  void,
  { rejectValue: string; state: RootState }
>(
  'deliveries/fetchDeliveriesByDrivers',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { drivers } = state.drivers;
    const enterpriseId = state.user.enterprise?.enterprise_id;

    if (!enterpriseId || enterpriseId === -1) {
      return {
        deliveries: [],
        deliveryById: {},
        deliveriesByDriverId: {},
      };
    }

    try {
      const formattedDate = moment(state.sidebar.date).format('YYYY-MM-DD');
      const allDeliveries = await deliverieService.getAll({
        enterprise: String(enterpriseId),
        date: formattedDate,
      });

      const deliveryById: Record<number, IFDeliverie> = {};
      const deliveriesByDriverId: Record<number, IFDeliverie[]> = {};

      for (const driver of drivers) {
        deliveriesByDriverId[driver.id] = [];
      }

      for (const item of allDeliveries) {
        deliveryById[item.id] = item;
        if (!deliveriesByDriverId[item.driverId]) {
          deliveriesByDriverId[item.driverId] = [];
        }
        deliveriesByDriverId[item.driverId].push(item);
      }

      return {
        deliveries: allDeliveries,
        deliveryById,
        deliveriesByDriverId,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al obtener entregas de Firestore');
    }
  }
);

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    resetDeliveries: () => initialState,
    setDeliveries(state, action: PayloadAction<IFDeliverie[]>) {
      state.deliveries = action.payload;
      state.deliveryById = action.payload.reduce<Record<number, IFDeliverie>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    },
    changeOneVisibility(state, action: PayloadAction<number>) {
      state.watchList = toggleOneVisibility(action.payload, state.watchList);
    },
    changeAllVisibility(state, action: PayloadAction<boolean>) {
      state.watchList = toggleAllVisibility(action.payload, state.deliveries);
    },
    changeWatchedList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },
    changeFocus(state, action: PayloadAction<number>) {
      state.watchList = toggleFocus(action.payload, state.watchList, state.deliveries);
    },
    changeDriverDeliveriesVisibility(
      state,
      action: PayloadAction<IChangeDriverDeliveriesVisibilityPayload>
    ) {
      const { driverId, visibility } = action.payload;
      const driverDeliveryIds = (state.deliveriesByDriverId[driverId] || []).map((d) => d.id);

      if (visibility) {
        const watchSet = new Set(state.watchList);
        const newIds = driverDeliveryIds.filter((id) => !watchSet.has(id));
        state.watchList = [...state.watchList, ...newIds];
      } else {
        const idSet = new Set(driverDeliveryIds);
        state.watchList = state.watchList.filter((id) => !idSet.has(id));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, () => initialState)
      .addCase(fetchDeliveriesByDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveriesByDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload.deliveries;
        state.deliveryById = action.payload.deliveryById;
        state.deliveriesByDriverId = action.payload.deliveriesByDriverId;

        const validIds = new Set(action.payload.deliveries.map((d) => d.id));
        const filteredWatchList = state.watchList.filter((id) => validIds.has(id));
        state.watchList = filteredWatchList.length > 0
          ? filteredWatchList
          : action.payload.deliveries.map((d) => d.id);
      })
      .addCase(fetchDeliveriesByDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error desconocido al cargar entregas';
        state.watchList = [];
      });
  },
});

export const {
  resetDeliveries,
  setDeliveries,
  changeOneVisibility,
  changeAllVisibility,
  changeWatchedList,
  changeFocus,
  changeDriverDeliveriesVisibility,
} = deliveriesSlice.actions;

export const changeOneDeliveryVisibility = changeOneVisibility;

export const selectDeliveries = (state: RootState) => state.deliveries.deliveries;
export const selectDeliveryById = (state: RootState) => state.deliveries.deliveryById;
export const selectDeliveriesByDriverId = (state: RootState) => state.deliveries.deliveriesByDriverId;
export const selectDeliveriesWatchList = (state: RootState) => state.deliveries.watchList;
export const selectDeliveriesLoading = (state: RootState) => state.deliveries.loading;
export const selectDeliveriesError = (state: RootState) => state.deliveries.error;

export const selectDeliveriesByWatchedDrivers = createSelector(
  [
    (state: RootState) => state.drivers.watchList,
    (state: RootState) => state.drivers.filterList,
    (state: RootState) => state.deliveries.deliveriesByDriverId,
  ],
  (driversWatchList, driversFilterList, deliveriesByDriverId): IFDeliverie[] =>
    driversWatchList.flatMap((driverId) => {
      const isVisible = getVisibilityState(driverId, driversWatchList, driversFilterList).visibleInMap;
      return isVisible ? deliveriesByDriverId[driverId] ?? [] : [];
    })
);

export const selectVisibleDeliveries = createSelector(
  [
    selectDeliveriesByWatchedDrivers,
    (state: RootState) => state.deliveries.watchList,
  ],
  (watchedDriverDeliveries, deliveriesWatchList): IFDeliverie[] => {
    const watchListSet = new Set(deliveriesWatchList);
    return watchedDriverDeliveries.filter((delivery) => watchListSet.has(delivery.id));
  }
);

export default deliveriesSlice.reducer;
