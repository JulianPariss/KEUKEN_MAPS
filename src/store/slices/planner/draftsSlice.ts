import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IDraft, IDraftState } from '../../../utils/types/planner/draft.types';
import type { RootState } from '../..';
import { deleteDraft, getDrafts, updateDraft } from '../../../services/plannerServices/draft.service';
import { createGeoZone, deleteGeoZone, getAllGeozones } from '../../../services/plannerServices/geozones.service';
import type { IGeoZone } from '../../../utils/types/planner/geozones.types';
import { notify } from '../../../utils/helpers/messageHelper';
import type { ISeller } from '../../../utils/types/planner/sellers.types';
import { getMobileUsers } from '../../../services/plannerServices/sellers.service';
import type { IHistoryClient } from '../../../utils/types/sellerObserver/history.types';
import { getHistoryDraftClients } from '../../../services/plannerServices/history.service';
import { createExcludedClient, deleteExcludedClient } from '../../../services/excludedClients.service';
import { isAbortError } from '../../../services';

type TGroupList = 'geozones' | 'history';

interface ToggleExcludePayload {
    id: number;
}

interface ToggleExcludeResult {
    id: number;
    excluded: boolean;
}


const initialState: IDraftState = {
    drafts: [],
    currentDraft: -1,
    loading: true,
    error: undefined,
    sellers: {
        sellers: [],
        sellerById: {},
        loading: false,
        error: undefined,
    },
    geozones: {
        geozones: [],
        geozonesById: {},
        watchList: [],
        filterList: [],
        loading: false,
        error: undefined,
    },
    history: {
        clients: [],
        clientsById: {},
        watchList: [],
        filterList: [],
        loading: false,
        error: undefined,
        excludeLoadingById: []
    },
};

// GEOZONES

export const newGeozone = createAsyncThunk<any, { data: any }, { rejectValue: string, state: RootState }>(
    'drafts/geozone/new',
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
            notify(error?.detail ?? 'Ocurrió un error al crear la geozona', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch profile data');
        }
    }
);

export const getGeozones = createAsyncThunk<IGeoZone[], void, { rejectValue: string, state: RootState }>(
    'drafts/geozone/all',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const { currentDraft } = state.drafts;
        const { enterprise } = state.user;
        try {
            const response = (await getAllGeozones(enterprise.enterprise_id, currentDraft)).filter((geo) => !geo.is_deleted);
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

export const deleteGeozone = createAsyncThunk<number, { draft_geozone_id: number, enterprise_id: number }, { rejectValue: string, state: RootState }>(
    'drafts/geozone/delete',
    async (params, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise } = state.user;
        try {
            return await deleteGeoZone(params.draft_geozone_id, enterprise.enterprise_id).then(() => {
                return params.draft_geozone_id;
            });
        } catch (error: any) {
            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al eliminar la geozona', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to delete geozone')
        }
    }
)

// DRAFTS

export const fetchDrafts = createAsyncThunk<{ drafts: IDraft[] }, {}, { rejectValue: string, state: RootState }>(
    'drafts/fetchDrafts',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise } = state.user;
        try {
            const response = await getDrafts(enterprise.enterprise_id);
            return {
                drafts: response,
            };
        } catch (error: any) {
            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al buscar los borradores', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
        }
    }
);

export const removeDraft = createAsyncThunk<number, { draft_id: number }, { rejectValue: string, state: RootState }>(
    'drafts/delete',
    async (params, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise_id } = state.user.enterprise;
        try {
            return await deleteDraft(enterprise_id, params.draft_id).then(() => {
                return params.draft_id;
            });
        } catch (error: any) {

            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al eliminar el borrador', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to delete geozone')
        }
    }
)

export const updateDraftThunk = createAsyncThunk<IDraft, { draft_id: number, data: any }, { rejectValue: string, state: RootState }>(
    'drafts/update',
    async (params, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise_id } = state.user.enterprise;
        try {
            return await updateDraft(enterprise_id, params.draft_id, params.data).then((res) => {
                return res;
            });
        } catch (error: any) {

            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al actualizar el borrador', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to delete geozone')
        }
    }
)

// SELLERS

export const fetchSellers = createAsyncThunk<{ sellers: ISeller[] }, void, { rejectValue: string, state: RootState }>(
    'drafts/seller/all',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise } = state.user;
        try {
            const response = await getMobileUsers(enterprise.enterprise_id);
            return {
                sellers: response,
            };
        } catch (error: any) {

            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al buscar los vendedores', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
        }
    }
);

// CLIENTS

export const fetchHistoryClients = createAsyncThunk<{ clients: IHistoryClient[] }, void, { rejectValue: string, state: RootState }>(
    'drafts/history/all',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const { enterprise } = state.user;
        const currentDraft = state.drafts.currentDraft;
        try {
            let response: IHistoryClient[] = [];
            enterprise.enterprise_id != -1 ? response = await getHistoryDraftClients(enterprise.enterprise_id, currentDraft) : [];
            return {
                clients: response ?? [],
            };
        } catch (error: any) {

            if (isAbortError(error)) {
                return thunkAPI.rejectWithValue('__ABORT__');
            }

            notify(error?.detail ?? 'Ocurrió un error al buscar los clientes', 'ERROR')
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
        }
    }
);

export const toggleExcludeClient = createAsyncThunk<
    ToggleExcludeResult,
    ToggleExcludePayload,
    { state: RootState }
>(
    "drafts/history/toggleExcludeClient",
    async ({ id }, { getState, rejectWithValue }) => {
        const state = getState();
        const { enterprise_id } = state.user.enterprise;

        const index = state.drafts.history.clientsById[id];
        const client = state.drafts.history.clients[index];

        if (!client) {
            return rejectWithValue("CLIENT_NOT_FOUND");
        }

        const currentExcluded = client.excluded;
        const nextExcluded = !currentExcluded;

        try {
            if (currentExcluded) {
                await deleteExcludedClient(enterprise_id, id);
            } else {
                await createExcludedClient(enterprise_id, { client_id: id });
            }

            return {
                id,
                excluded: nextExcluded,
            };
        } catch (error: any) {
            notify(error?.detail ?? 'Ocurrió un error al intentar exluir/incluir al cliente', 'ERROR')
            return rejectWithValue("REQUEST_FAILED");
        }
    }
);


const toggleAllVisibility = <T, K extends keyof T>(
    visibility: boolean,
    items: T[],
    key: K
): T[K][] => visibility ? items.map(item => item[key]) : [];

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

const draftsSlice = createSlice({
    name: 'drafts',
    initialState,
    reducers: {
        resetDrafts: () => initialState,
        resetGeozone(state) { state.geozones = initialState.geozones },
        resetSeller(state) { state.sellers = initialState.sellers },
        resetHistory(state) { state.history = initialState.history },
        /* editGeozoneReducer(state, action: PayloadAction<IGeoZone>) {
            state.geozones.geozones = state.geozones.geozones.map((geo) => {
                if (action.payload.id === geo.id) {
                    return { ...action.payload }
                } else return geo;
            })
        }, */
        addNewDraft(state, action: PayloadAction<IDraft>) {
            const index = state.drafts.findIndex(
                f => f.id === action.payload.id
            );
            if (index !== -1) {
                state.drafts[index] = action.payload;
            } else {
                state.drafts.push(action.payload);
            }
        },
        changeCurrentDraft(state, action: PayloadAction<number>) {
            const exists = state.drafts.some(d => d.id === action.payload);
            state.currentDraft = exists ? action.payload : -1;
        },

        // WATCH LIST

        changeOneVisibility(state, action: PayloadAction<{ id: number, group: TGroupList }>) {
            switch (action.payload.group) {
                case 'geozones':
                    state.geozones.watchList = toggleOneVisibility(action.payload.id, state.geozones.watchList);
                    break;
                default: null;
            }
        },
        changeAllVisibility(state, action: PayloadAction<{ opp: boolean, group: TGroupList }>) {
            switch (action.payload.group) {
                case 'geozones':
                    state.geozones.watchList = toggleAllVisibility(action.payload.opp, state.geozones.geozones, 'id');
                    break;
                case 'history':
                    state.history.watchList = toggleAllVisibility(action.payload.opp, state.history.clients, 'id');
                    break;
                default: null;
            }
        },

        changeWatchedList(state, action: PayloadAction<{ wl: number[], group: TGroupList }>) {
            switch (action.payload.group) {
                case 'geozones':
                    state.geozones.watchList = action.payload.wl;
                    break;
                case 'history':
                    state.history.watchList = action.payload.wl;
                    break;
                default: null;
            }
        },

        // FILTER LIST

        changeOneFilter(state, action: PayloadAction<{ id: number, group: TGroupList }>) {
            switch (action.payload.group) {
                case 'history':
                    state.history.filterList = toggleOneVisibility(action.payload.id, state.history.filterList);
                    break;
                case 'geozones':
                    state.geozones.filterList = toggleOneVisibility(action.payload.id, state.geozones.filterList);
                    break;
                default: null;
            }
        },
        changeAllFilter(state, action: PayloadAction<{ opp: boolean, group: TGroupList }>) {
            switch (action.payload.group) {
                case 'history':
                    state.history.filterList = toggleAllVisibility(action.payload.opp, state.history.clients, 'id');
                    break;
                case 'geozones':
                    state.geozones.filterList = toggleAllVisibility(action.payload.opp, state.geozones.geozones, 'id');
                    break;
                default: null;
            }
        },
        changeFilteredList(state, action: PayloadAction<{ wl: number[], group: TGroupList }>) {
            switch (action.payload.group) {
                case 'history':
                    state.history.filterList = action.payload.wl;
                    break;
                case 'geozones':
                    state.geozones.filterList = action.payload.wl;
                    break;
                default: null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // DRAFT

            .addCase(fetchDrafts.pending, state => {
                state.drafts = [];
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDrafts.fulfilled, (state, action) => {
                state.drafts = action.payload.drafts;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchDrafts.rejected, (state, action) => {
                state.drafts = [];
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
            })

            .addCase(removeDraft.pending, (state) => {
                state.currentDraft = -1;
                state.loading = true;
                state.error = null;
            })
            .addCase(removeDraft.fulfilled, (state, action) => {
                notify('Se elimino con éxito', 'WARN');
                state.drafts = state.drafts.filter((geo) => {
                    return geo.id !== action.payload
                })
                state.loading = false;
            })

            .addCase(updateDraftThunk.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDraftThunk.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.drafts.findIndex(drf => drf.id === action.payload.id);
                if (idx !== -1) {
                    state.drafts[idx] = action.payload;
                }
            })
            .addCase(updateDraftThunk.rejected, state => {
                state.loading = false;
                state.error = null;
            })

            // GEO ZONES 

            .addCase(newGeozone.pending, (state) => {
                state.geozones.loading = true;
                state.geozones.error = null;
            })
            .addCase(newGeozone.fulfilled, (state, action) => {
                const { geozone } = action.payload;
                notify('Geozona creada con éxito', 'SUCCESS');
                state.geozones.loading = false;
                state.geozones.geozones = [...state.geozones.geozones, geozone];
                state.geozones.watchList = [...state.geozones.watchList, geozone.id];
                state.geozones.geozonesById = rebuildIndexTable(state.geozones.geozones);
            })
            .addCase(newGeozone.rejected, (state) => {
                state.geozones.loading = false;
            })
            .addCase(getGeozones.pending, (state) => {
                state.geozones.loading = true;
                state.geozones.error = null;
            })
            .addCase(getGeozones.fulfilled, (state, action) => {
                state.geozones.geozones = action.payload;
                state.geozones.loading = false;
                state.geozones.geozonesById = rebuildIndexTable(state.geozones.geozones);
            })
            .addCase(getGeozones.rejected, (state) => {
                state.geozones.loading = false;
                state.geozones.geozones = [];
                state.geozones.watchList = [];
            })
            .addCase(deleteGeozone.pending, (state) => {
                state.geozones.loading = true;
                state.geozones.error = null;
            })
            .addCase(deleteGeozone.fulfilled, (state, action) => {
                notify('Se elimino con éxito', 'WARN');
                state.geozones.geozones = state.geozones.geozones.filter((geo) => {
                    return geo.id !== action.payload
                })
                state.geozones.watchList = state.geozones.watchList.filter((geo) => geo !== action.payload);
                state.geozones.geozonesById = rebuildIndexTable(state.geozones.geozones);
                state.geozones.loading = false;
            })

            // SELLERS 

            .addCase(fetchSellers.pending, state => {
                state.sellers.loading = true;
                state.sellers.error = null;
            })
            .addCase(fetchSellers.fulfilled, (state, action) => {
                state.sellers.loading = false;
                state.sellers.sellers = action.payload.sellers;
                state.sellers.sellerById = action.payload.sellers.reduce<{ [key: number]: ISeller }>((acc, val) => {
                    acc[val.id] = val;
                    return acc;
                }, {})
            })
            .addCase(fetchSellers.rejected, (state, action) => {
                state.sellers.loading = false;
                state.sellers.error = action.payload ?? 'Unknown error';
                state.sellers.sellers = [];
                state.sellers.sellerById = {};
            })

            // HISTORY CLIENTS

            .addCase(fetchHistoryClients.pending, state => {
                state.history.loading = true;
                state.history.error = null;
            })
            .addCase(fetchHistoryClients.fulfilled, (state, action) => {
                state.history.clients = action.payload.clients ?? [];

                state.history.clientsById = rebuildIndexTable(state.history.clients);
                state.history.loading = false;
            })
            .addCase(fetchHistoryClients.rejected, (state, action) => {
                state.history.loading = false;
                state.history.error = action.payload ?? 'Unknown error';
                state.history.clients = [];
            })

            .addCase(toggleExcludeClient.pending, (state, action) => {
                state.history.excludeLoadingById[action.meta.arg.id] = true;
            })
            .addCase(toggleExcludeClient.fulfilled, (state, action) => {
                state.history.excludeLoadingById[action.payload.id] = false;

                const { id, excluded } = action.payload;
                const index = state.history.clientsById[id];

                if (index === undefined) return;

                state.history.clients[index].excluded = excluded;
            })
            .addCase(toggleExcludeClient.rejected, (state, action) => {
                state.history.excludeLoadingById[action.meta.arg.id] = false;
            })
    }
});

export const {
    addNewDraft,
    resetDrafts,
    resetGeozone,
    resetHistory,
    resetSeller,
    //editGeozoneReducer,
    changeAllFilter,
    changeFilteredList,
    changeOneFilter,
    changeCurrentDraft,
    changeOneVisibility,
    changeAllVisibility,
    changeWatchedList,
} = draftsSlice.actions;
export default draftsSlice.reducer;
