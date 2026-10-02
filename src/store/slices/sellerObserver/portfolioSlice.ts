import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import type { IPortfolio, IPortfolioState } from '../../../utils/types/sellerObserver/portfolios.types';
import { getPortfolios } from '../../../services/portfolios.service';
import { notify } from '../../../utils/helpers/messageHelper';
import { isAbortError } from '../../../services';


const initialState: IPortfolioState = {
  porfolios: [],
  portfoliosById: {},
  sellersPortfolios: {},
  watchList: [],
  visible: false,
  loading: true,
  error: undefined,
};


export const fetchPortfolios = createAsyncThunk<{ portfolios: IPortfolio[] }, void, { rejectValue: string, state: RootState }>(
  'portfolios/fetchPortfolios',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    try {
      const response = await getPortfolios(enterprise.enterprise_id);
      return {
        portfolios: response ?? [],
      };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }


      notify(error?.detail ?? 'Ocurrió un error al buscar las carteras', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

const toggleAllVisibility = (visibility: boolean, porfolios: IPortfolio[]): number[] => {
  let wl: number[] = [];
  if (visibility) {
    wl = porfolios.map((porfolio) => porfolio.id);
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


const portfoliosSlice = createSlice({
  name: 'portfolios',
  initialState,
  reducers: {
    resetPortfolio: () => initialState,
    changeOneVisibility(state, action: PayloadAction<number>) {
      state.watchList = toggleOneVisibility(action.payload, state.watchList);
    },
    changeAllVisibility(state, action: PayloadAction<boolean>) {
      state.watchList = toggleAllVisibility(action.payload, state.porfolios);
    },
    changeFilteredList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.porfolios = action.payload.portfolios;
        state.sellersPortfolios = action.payload.portfolios.reduce((acc, portfolio) => {
          const groupKey = portfolio.mobileUser;
          if (!acc[groupKey]) {
            acc[groupKey] = [];
          }
          acc[groupKey].push(portfolio);
          return acc;
        }, {} as Record<string, IPortfolio[]>);

        state.portfoliosById = rebuildIndexTable(state.porfolios);
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
        state.sellersPortfolios = {};
        state.portfoliosById = {};
        state.porfolios = [];
      })
  }
});

export const { changeOneVisibility, changeAllVisibility, changeFilteredList, resetPortfolio } = portfoliosSlice.actions;
export default portfoliosSlice.reducer;
