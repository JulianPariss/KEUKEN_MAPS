import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { indexToColor } from '@repo/map-core';
import { notify } from '../../../utils/helpers/messageHelper';
import { isAbortError } from '../../../services';
import type { IDriverState, IRoute, IUIDriver, TNestedRoutes } from '../../../utils/types/driverObserver/drivers.types';
import type { IMobileUser } from '../../../utils/types/mobileUser.types';
import { getAllMobileUsers } from '../../../services/mobileUser.service';
import moment from 'moment';
import { getRouteHistoryByPhone } from '../../../services/locations.service';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';
import { driverConfigService } from '@repo/firebase-services';
import type { IFDriverConfig } from '@repo/api-contracts/firebase';

export interface IChangeSellerColorPayload {
  driverId: number;
  color: string;
}

export interface IAddRoutePointPayload {
  id: number;
  subId: string;
  point: IRoute;
}

export interface ISetIsAnimatingPayload {
  isAnimating: boolean;
  driverAnimated: number | null;
}

const initialState: IDriverState = {
  drivers: [],
  driverById: {},
  driversUI: {},
  configByDriverId: {},
  watchList: [],
  filterList: [],
  driverRoutes: {
    routes: {},
    loading: false,
    error: undefined,
  },
  animation: {
    isAnimating: false,
    driverAnimated: null,
  },
  loading: true,
  error: null,
};

const toggleAllVisibility = (visibility: boolean, drivers: IMobileUser[]): number[] =>
  visibility ? drivers.map((driver) => driver.id) : [];

const toggleOneVisibility = (id: number, watchList: number[]): number[] => {
  const index = watchList.indexOf(id);
  return index >= 0
    ? [...watchList.slice(0, index), ...watchList.slice(index + 1)]
    : [...watchList, id];
};

export const isFocussed = (id: number, watchList: number[]): boolean =>
  watchList.length === 1 && watchList.includes(id);

const toggleFocus = (id: number, watchList: number[], drivers: IMobileUser[]): number[] =>
  isFocussed(id, watchList) ? toggleAllVisibility(true, drivers) : [id];

export const fetchDriverConfigs = createAsyncThunk<
  Record<number | string, IFDriverConfig>,
  void,
  { rejectValue: string; state: RootState }
>(
  'drivers/fetchDriverConfigs',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const enterpriseId = state.user.enterprise?.enterprise_id;

    if (!enterpriseId || enterpriseId === -1) {
      return {};
    }

    try {
      const configs = await driverConfigService.getAll(enterpriseId);
      const configByDriverId: Record<number | string, IFDriverConfig> = {};

      for (const config of configs) {
        if (config.id != null) {
          configByDriverId[config.id] = config;
          const numId = Number(config.id);
          if (!isNaN(numId)) {
            configByDriverId[numId] = config;
          }
        }
      }

      return configByDriverId;
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }
      notify(error?.detail ?? 'Ocurrió un error al buscar las configuraciones de los conductores', 'ERROR');
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch driver configs');
    }
  }
);

export const fetchDrivers = createAsyncThunk<
  { drivers: IMobileUser[] },
  void,
  { rejectValue: string; state: RootState }
>(
  'drivers/fetchDrivers',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const enterpriseId = state.user.enterprise?.enterprise_id;

    thunkAPI.dispatch(fetchDriverConfigs());

    try {
      const response = await getAllMobileUsers(enterpriseId, 'CHOFERES');
      return { drivers: response };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }
      notify(error?.detail ?? 'Ocurrió un error al buscar los conductores', 'ERROR');
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch drivers');
    }
  }
);

export const fetchAllLocationHistory = createAsyncThunk<
  { routes: TNestedRoutes },
  void,
  { rejectValue: string; state: RootState }
>(
  'locations/fetchHistory',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { drivers } = state.drivers;
    const { enterprise } = state.user;
    const { date } = state.sidebar;

    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const driverRoutes = await Promise.all(
        drivers.map(async (driver) => {
          try {
            const response = await getRouteHistoryByPhone({
              mobileUser: driver.id,
              enterprise_id: enterprise.enterprise_id,
              fecha_inicio: formattedDate,
            });
            return { [driver.id]: response };
          } catch {
            return { [driver.id]: {} };
          }
        })
      );

      const combinedRoutes = driverRoutes.reduce<TNestedRoutes>(
        (acc, item) => Object.assign(acc, item),
        {}
      );

      return { routes: combinedRoutes };
    } catch (error: any) {
      notify(error?.detail ?? 'Ocurrió un error al buscar las últimas ubicaciones de los conductores', 'ERROR');
      return thunkAPI.rejectWithValue('Failed to fetch location history');
    }
  }
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    resetDrivers: () => initialState,
    resetSeller: () => initialState,
    changeOneVisibility(state, action: PayloadAction<number>) {
      state.watchList = toggleOneVisibility(action.payload, state.watchList);
    },
    changeAllVisibility(state, action: PayloadAction<boolean>) {
      state.watchList = toggleAllVisibility(action.payload, state.drivers);
    },
    changeWatchedList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },
    changeOneFilter(state, action: PayloadAction<number>) {
      state.filterList = toggleOneVisibility(action.payload, state.filterList);
    },
    changeAllFilter(state, action: PayloadAction<boolean>) {
      state.filterList = toggleAllVisibility(action.payload, state.drivers);
    },
    changeFilteredList(state, action: PayloadAction<number[]>) {
      state.filterList = action.payload;
    },
    changeFocus(state, action: PayloadAction<number>) {
      state.watchList = toggleFocus(action.payload, state.watchList, state.drivers);
    },
    changeSellerColor(state, action: PayloadAction<IChangeSellerColorPayload>) {
      const { driverId, color } = action.payload;
      if (state.driverById[driverId] && state.driversUI[driverId]) {
        state.driversUI[driverId].color = color;
      }
    },
    addRoutePoint(state, action: PayloadAction<IAddRoutePointPayload>) {
      const { id, subId, point } = action.payload;
      if (id == null) return;

      if (!state.driverRoutes.routes[id]) {
        state.driverRoutes.routes[id] = {};
      }
      if (!state.driverRoutes.routes[id][subId]) {
        state.driverRoutes.routes[id][subId] = [];
      }
      state.driverRoutes.routes[id][subId].push(point);
    },
    setIsAnimating(state, action: PayloadAction<ISetIsAnimatingPayload>) {
      state.animation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, (state) => {
        state.driverRoutes = {
          routes: {},
          loading: false,
          error: undefined,
        };
        state.animation = {
          isAnimating: false,
          driverAnimated: null,
        };
      })
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.drivers;

        state.driverById = action.payload.drivers.reduce<Record<number, IMobileUser>>((acc, val) => {
          acc[val.id] = val;
          return acc;
        }, {});

        state.driversUI = action.payload.drivers.reduce<Record<number, IUIDriver>>((acc, val) => {
          acc[val.id] = {
            color: val.color ?? indexToColor(val.id),
          };
          return acc;
        }, {});
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.drivers = [];
        state.driverById = {};
        state.driversUI = {};
        state.watchList = [];
        state.driverRoutes.routes = {};
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(fetchAllLocationHistory.fulfilled, (state, action) => {
        state.driverRoutes.routes = action.payload.routes;
      })
      .addCase(fetchAllLocationHistory.rejected, (state) => {
        state.driverRoutes.routes = {};
      })
      .addCase(fetchDriverConfigs.fulfilled, (state, action) => {
        state.configByDriverId = action.payload;
      });
  },
});

export const {
  changeOneVisibility,
  changeAllVisibility,
  changeFocus,
  addRoutePoint,
  setIsAnimating,
  changeSellerColor,
  changeWatchedList,
  changeAllFilter,
  changeFilteredList,
  changeOneFilter,
  resetDrivers,
  resetSeller,
} = driversSlice.actions;

export const selectDrivers = (state: RootState) => state.drivers.drivers;
export const selectDriverById = (state: RootState) => state.drivers.driverById;
export const selectDriverConfigByDriverId = (state: RootState) => state.drivers.configByDriverId;
export const selectDriverConfig = (state: RootState, driverId: number | string) =>
  state.drivers.configByDriverId[driverId];
export const selectDriversWatchList = (state: RootState) => state.drivers.watchList;
export const selectDriversFilterList = (state: RootState) => state.drivers.filterList;
export const selectDriverRoutes = (state: RootState) => state.drivers.driverRoutes;
export const selectDriverAnimation = (state: RootState) => state.drivers.animation;
export const selectDriversLoading = (state: RootState) => state.drivers.loading;
export const selectDriversError = (state: RootState) => state.drivers.error;

export default driversSlice.reducer;
