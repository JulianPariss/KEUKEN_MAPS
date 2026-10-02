import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../..";
import { isAbortError } from "../../../services";
import { notify } from "../../../utils/helpers/messageHelper";
import type { IStatSlice, ISellerStat, IMultipleSellerStatResponse } from "../../../utils/types/sellerObserver/stats.types";
import { getAllSellersStats, getSellerStatsById } from "../../../services/stats.service";
import moment from "moment";


const initialState: IStatSlice = {
    statsBySellerId: {},
    loading: true,
    error: null,
};

export const fetchAllSellersStats = createAsyncThunk<{ stats: IMultipleSellerStatResponse[] }, { sellersIds: number[] }, { rejectValue: string, state: RootState }>(
    'stats/fetchAllSellersStats',
    async (params, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise_id } = state.user.enterprise;
        const { date } = state.sidebar
        try {
            const response = await getAllSellersStats({
                enterprise: enterprise_id,
                sellersIds: params.sellersIds,
                startDate: moment(date).format('YYYY-MM-DD')
            })
            return {
                stats: response,
            };
        } catch (error: any) {
            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }
            notify(error?.detail ?? 'Ocurrió un error al buscar las estadísticas vendedores', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch sellers');
        }
    }
);

export const fetchSellerStatsById = createAsyncThunk<{ stats: ISellerStat, sellerId: number }, { sellerId: number }, { rejectValue: string, state: RootState }>(
    'stats/fetchSellerStatsById',
    async (params, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise_id } = state.user.enterprise;
        const { date } = state.sidebar
        try {
            const response = await getSellerStatsById({
                enterprise: enterprise_id,
                sellerId: params.sellerId,
                startDate: moment(date).format('YYYY-MM-DD')
            })
            return {
                stats: response,
                sellerId: params.sellerId
            };
        } catch (error: any) {
            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al buscar las estadísticas del vendedor', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch sellers');
        }
    }
);


const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        resetSeller: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(fetchAllSellersStats.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSellersStats.fulfilled, (state, action) => {
                state.loading = false;
                state.statsBySellerId = action.payload.stats.reduce((acc: Record<number, ISellerStat>, value) => {
                    const { seller, ...parsedValue } = value;
                    acc[value.seller] = parsedValue.route_stats;
                    return acc;
                }, {});
            })
            .addCase(fetchAllSellersStats.rejected, (state, action) => {
                state.statsBySellerId = {};
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
            })

            .addCase(fetchSellerStatsById.pending, state => {
                state.error = null;
            })
            .addCase(fetchSellerStatsById.fulfilled, (state, action) => {
                state.statsBySellerId[action.payload.sellerId] = action.payload.stats;

            })
            .addCase(fetchSellerStatsById.rejected, (state, action) => {
                state.error = action.payload ?? 'Unknown error';
            })
    },
});

export const {
    resetSeller
} = statsSlice.actions;
export default statsSlice.reducer;
