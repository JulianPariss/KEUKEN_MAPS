import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getHistoryClientById, getHistoryClients } from "../../../services/history.service";
import type { RootState } from "../..";
import { notify } from "../../../utils/helpers/messageHelper";
import type { IHistoryClient, IHistoryState } from "../../../utils/types/sellerObserver/history.types";
import { createExcludedClient, deleteExcludedClient } from "../../../services/excludedClients.service";
import { isAbortError } from "../../../services";


interface ToggleExcludePayload {
  id: number;
}

interface ToggleExcludeResult {
  id: number;
  excluded: boolean;
}

const initialState: IHistoryState = {
  loading: true,
  error: undefined,
  clients: [],
  clientsById: [],
  watchList: [],
  excludeLoadingById: [],
  filterList: []
};


export const updateClient = createAsyncThunk<{ client: IHistoryClient }, { client_id: number }, { rejectValue: string, state: RootState }>(
  'history/updateClient',
  async (params, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    try {
      const response = await getHistoryClientById(enterprise.enterprise_id, params.client_id);
      return {
        client: response ?? null,
      };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al actualizar al cliente', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

export const fetchHistoryClients = createAsyncThunk<{ clients: IHistoryClient[] }, { days: null }, { rejectValue: string, state: RootState }>(
  'history/fetchHistoryClients',
  async (params, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    try {
      let response: IHistoryClient[] = [];
      enterprise.enterprise_id != -1 ? response = await getHistoryClients(enterprise.enterprise_id, params.days) : [];
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
  "history/toggleExcludeClient",
  async ({ id }, { getState, rejectWithValue }) => {
    const state = getState();
    const { enterprise_id } = state.user.enterprise;

    const index = state.history.clientsById[id];
    const client = state.history.clients[index];

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
      if (isAbortError(error)) {
        return rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al excluir/incluir al cliente', 'ERROR')
      return rejectWithValue("REQUEST_FAILED");
    }
  }
);

const rebuildIndexTable = (list: any[]) =>
  list.reduce<{ [key: string]: number }>((acc, val, index) => {
    acc[val.id] = index;
    return acc;
  }, {});

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    resetHistory: () => initialState,
    changeFilteredList(state, action: PayloadAction<number[]>) {
      state.watchList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryClients.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoryClients.fulfilled, (state, action) => {
        state.clients = action.payload.clients ?? [];

        state.clientsById = rebuildIndexTable(state.clients);

        state.loading = false;
      })
      .addCase(fetchHistoryClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
        state.clients = [];
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const updated = action.payload.client
        const index = state.clients.findIndex(c => c.id === updated.id)
        if (index !== -1) {
          state.clients[index] = updated
        }
      })
      .addCase(updateClient.rejected, () => {
        notify('Ocurrio un error al actualizar la lista de clientes.', 'ERROR')
      })


      .addCase(toggleExcludeClient.pending, (state, action) => {
        state.excludeLoadingById[action.meta.arg.id] = true;
      })
      .addCase(toggleExcludeClient.fulfilled, (state, action) => {
        state.excludeLoadingById[action.payload.id] = false;

        const { id, excluded } = action.payload;
        const index = state.clientsById[id];

        if (index === undefined) return;

        state.clients[index].excluded = excluded;
      })
      .addCase(toggleExcludeClient.rejected, (state, action) => {
        state.excludeLoadingById[action.meta.arg.id] = false;
      })
  }
});

export const { changeFilteredList, resetHistory } = historySlice.actions;
export default historySlice.reducer;