import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IClient, IClientsState } from '../../../utils/types/sellerObserver/clients.types';
import type { RootState } from '../..';
import { getAllClients } from '../../../services/clients.service';
import moment from 'moment';
import { fetchAllOrders } from '../../sharedThunks';
import { notify } from '../../../utils/helpers/messageHelper';
import { isAbortError } from '../../../services';


const initialState: IClientsState = {
  clients: [],
  clientsBySeller: {},
  clientsById: {},
  clientsOrders: {
    orders: {},
    loading: false,
    error: undefined,
  },
  visible: true,
  loading: true,
  error: undefined
};


export const fetchClients = createAsyncThunk<{ clients: IClient[] }, {}, { rejectValue: string, state: RootState }>(
  'clients/fetchClients',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    const { date } = state.sidebar;
    try {
      const response = await getAllClients(enterprise.enterprise_id, moment(date).format('YYYY-MM-DD'));
      return {
        clients: response,
      };
    } catch (error: any) {
      if (isAbortError(error)) {  
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar los clientes', 'ERROR');
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);


const rebuildIndexTable = (list: any[]) =>
  list.reduce<{ [key: string]: number }>((acc, val, index) => {
    acc[val.code] = index;
    return acc;
  }, {});

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    resetClients: () => initialState,
    changeVisibility(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.clientsBySeller = action.payload.clients.reduce((acc, client) => {
          const groupKey = client.mobileUser;
          if (!acc[groupKey]) {
            acc[groupKey] = [];
          }
          acc[groupKey].push(client);
          return acc;
        }, {} as Record<string, IClient[]>);

        state.clientsById = rebuildIndexTable(state.clients)
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
        state.clientsBySeller = {};
        state.clients = [];
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.clientsOrders.orders = action.payload.clientOrders;
      })
      .addCase(fetchAllOrders.rejected, (state) => {
        state.clientsOrders.orders = [];
      })
  }
});

export const { changeVisibility, resetClients } = clientsSlice.actions;
export default clientsSlice.reducer;
