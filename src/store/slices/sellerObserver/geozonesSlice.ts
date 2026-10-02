import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createGeoZone, deleteGeoZone, getAllGeozones } from '../../../services/geozones.service';
import type { IGeoZone, IGeoZonesState } from '../../../utils/types/sellerObserver/geozones.types';
import { notify } from '../../../utils/helpers/messageHelper';
import type { RootState } from '../..';
import { isAbortError } from '../../../services';

const initialState: IGeoZonesState = {
  geozones: [],
  geozonesById: {},
  watchList: [],
  filterList: [],
  loading: true,
  error: null,
};

export const newGeozone = createAsyncThunk<any, { data: any }, { rejectValue: string, state: RootState }>(
  'geozone/new',
  async (params, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise_id } = state.user.enterprise;
    try {
      const response = await createGeoZone(enterprise_id, params.data);

      return {
        geozone: response,
      };
    } catch (error: any) {

      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al crear la geozona', 'ERROR');
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch profile data');
    }
  }
);

export const getGeozones = createAsyncThunk<IGeoZone[], void, { rejectValue: string, state: RootState }>(
  'geozone/all',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise_id } = state.user.enterprise;
    try {
      const response = await getAllGeozones(enterprise_id);
      return response;
    } catch (error: any) {

      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar las geozonas', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch geozones')
    }
  }
);

export const deleteGeozone = createAsyncThunk<{ id: number, message: string }, { geozone_id: number, enterprise_id: number }, { rejectValue: string }>(
  'geozone/delete',
  async (params, thunkAPI) => {
    try {
      const response = await deleteGeoZone(params.geozone_id, params.enterprise_id);
      return {
        id: params.geozone_id,
        message: response.message,
      };
    } catch (error: any) {

      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al eliminar la geozona', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete geozone')
    }
  }
)

const toggleAllVisibility = (visibility: boolean, geozones: IGeoZone[]): number[] => {
  let wl: number[] = [];
  if (visibility) {
    wl = geozones.map((geozones) => geozones.id);
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

const rebuildIndexTable = (list: any[]) =>
  list.reduce<{ [key: string]: number }>((acc, val, index) => {
    acc[val.id] = index;
    return acc;
  }, {});

const geoSlice = createSlice({
  name: 'geo',
  initialState,
  reducers: {
    resetGeozone: () => initialState,
    /* editGeozoneReducer(state, action: PayloadAction<IGeoZoneCreation>) {
      state.geozones = state.geozones.map((geo) => {
        if (action.payload.id === geo.id) {
          return { ...action.payload, tags: [{ key: "geozone", labels: action.payload.tags }] }
        } else return geo;
      })
    }, */
    changeOneVisibility(state, action: PayloadAction<number>) {
      state.watchList = toggleOneVisibility(action.payload, state.watchList);
    },
    changeAllVisibility(state, action: PayloadAction<boolean>) {
      state.watchList = toggleAllVisibility(action.payload, state.geozones);
    },
    changeWatchedList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },

    changeOneFilter(state, action: PayloadAction<number>) {
      state.filterList = toggleOneVisibility(action.payload, state.filterList);
    },
    changeAllFilter(state, action: PayloadAction<boolean>) {
      state.filterList = toggleAllVisibility(action.payload, state.geozones);
    },
    changeFilteredList(state, action: PayloadAction<number[]>) {
      state.filterList = action.payload;
    },

  },
  extraReducers: builder => {
    builder
      .addCase(newGeozone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(newGeozone.fulfilled, (state, action) => {
        const { message, geozone } = action.payload;
        notify(message, 'SUCCESS');
        state.loading = false;
        state.geozones = [...state.geozones, geozone];
        state.watchList = [...state.watchList, geozone.id];
        /* state.filterList = [...state.watchList, geozone.id]; */
        state.geozonesById = rebuildIndexTable(state.geozones);
      })
      .addCase(newGeozone.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getGeozones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGeozones.fulfilled, (state, action) => {
        state.geozones = action.payload;
        state.watchList = action.payload.map(geo => geo.id);
        state.loading = false;

        state.geozonesById = rebuildIndexTable(state.geozones);

        //state.filterList = state.watchList = action.payload.map(geo => geo.id);
      })
      .addCase(getGeozones.rejected, (state) => {
        state.loading = false;
        state.geozones = [];
        state.filterList = state.watchList = [];
      })
      .addCase(deleteGeozone.fulfilled, (state, action) => {
        const { id, message } = action.payload;
        notify(message, 'WARN');
        state.geozones = state.geozones.filter((geo) => {
          return geo.id !== id
        })

        state.geozonesById = rebuildIndexTable(state.geozones);
      })
  },
});

export const {
  //editGeozoneReducer, 
  changeOneVisibility,
  changeAllVisibility,
  changeWatchedList,
  changeFilteredList,
  changeAllFilter,
  changeOneFilter,
  resetGeozone,
} = geoSlice.actions;
export default geoSlice.reducer;
