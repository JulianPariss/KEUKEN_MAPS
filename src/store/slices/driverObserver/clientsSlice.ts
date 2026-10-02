import { createAsyncThunk, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { clientsService } from '@repo/firebase-services';
import type { IFDeliverie, IFDeliveryClient } from '@repo/api-contracts/firebase';
import { selectVisibleDeliveries } from './deliveriesSlice';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export interface IDeliveryClientsState {
  clients: IFDeliveryClient[];
  clientById: Record<number, IFDeliveryClient>;
  clientIdsByDeliveryId: Record<number, number[]>;
  loading: boolean;
  error: string | null;
}

export type TFetchClientsByDeliveriesArgs = IFDeliverie[] | void;

export interface IFetchClientsByDeliveriesResponse {
  clients: IFDeliveryClient[];
  clientById: Record<number, IFDeliveryClient>;
  clientIdsByDeliveryId: Record<number, number[]>;
}

export interface ISetDeliveryClientsPayload {
  clients: IFDeliveryClient[];
  clientById: Record<number, IFDeliveryClient>;
  clientIdsByDeliveryId: Record<number, number[]>;
}

const initialState: IDeliveryClientsState = {
  clients: [],
  clientById: {},
  clientIdsByDeliveryId: {},
  loading: false,
  error: null,
};

export const fetchClientsByDeliveries = createAsyncThunk<
  IFetchClientsByDeliveriesResponse,
  TFetchClientsByDeliveriesArgs,
  { rejectValue: string; state: RootState }
>(
  'deliveryClients/fetchClientsByDeliveries',
  async (argDeliveries, thunkAPI) => {
    const state = thunkAPI.getState();
    const deliveries = argDeliveries ?? state.deliveries.deliveries;
    const enterpriseId = state.user.enterprise?.enterprise_id;

    if (!deliveries || deliveries.length === 0) {
      return {
        clients: [],
        clientById: {},
        clientIdsByDeliveryId: {},
      };
    }

    const fallbackCompanyId = enterpriseId && enterpriseId !== -1 ? String(enterpriseId) : '';

    try {
      const deliveryResults = await Promise.all(
        deliveries.map(async (delivery) => {
          const companyId = delivery.enterprise || fallbackCompanyId;
          if (!companyId) {
            return { deliveryId: delivery.id, clients: [] as IFDeliveryClient[] };
          }

          try {
            const clients = await clientsService.getAll({
              companyId,
              deliveryId: delivery.id,
            });
            return { deliveryId: delivery.id, clients: clients ?? [] };
          } catch (error) {
            console.error(`Error al obtener clientes para el reparto ${delivery.id}:`, error);
            return { deliveryId: delivery.id, clients: [] as IFDeliveryClient[] };
          }
        })
      );

      const uniqueClients: IFDeliveryClient[] = [];
      const clientById: Record<number, IFDeliveryClient> = {};
      const clientIdsByDeliveryId: Record<number, number[]> = {};
      const seenClientIds = new Set<number>();

      for (const { deliveryId, clients } of deliveryResults) {
        clientIdsByDeliveryId[deliveryId] = [];

        for (const client of clients) {
          const clientKey = client.id;

          if (!seenClientIds.has(clientKey)) {
            seenClientIds.add(clientKey);
            uniqueClients.push(client);
            clientById[clientKey] = client;
            if (client.clientId) clientById[client.clientId] = client;
          }

          if (!clientIdsByDeliveryId[deliveryId].includes(clientKey)) {
            clientIdsByDeliveryId[deliveryId].push(clientKey);
          }
        }
      }

      return {
        clients: uniqueClients,
        clientById,
        clientIdsByDeliveryId,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Error al obtener clientes de los repartos en Firestore'
      );
    }
  }
);

export const deliveryClientsSlice = createSlice({
  name: 'deliveryClients',
  initialState,
  reducers: {
    resetDeliveryClients: () => initialState,
    setDeliveryClients(state, action: PayloadAction<ISetDeliveryClientsPayload>) {
      state.clients = action.payload.clients;
      state.clientById = action.payload.clientById;
      state.clientIdsByDeliveryId = action.payload.clientIdsByDeliveryId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, () => initialState)
      .addCase(fetchClientsByDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientsByDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.clientById = action.payload.clientById;
        state.clientIdsByDeliveryId = action.payload.clientIdsByDeliveryId;
      })
      .addCase(fetchClientsByDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error desconocido al cargar clientes de los repartos';
      });
  },
});

export const { resetDeliveryClients, setDeliveryClients } = deliveryClientsSlice.actions;

export const selectDeliveryClients = (state: RootState) => state.deliveryClients.clients;
export const selectDeliveryClientById = (state: RootState) => state.deliveryClients.clientById;
export const selectClientIdsByDeliveryId = (state: RootState) => state.deliveryClients.clientIdsByDeliveryId;
export const selectDeliveryClientsLoading = (state: RootState) => state.deliveryClients.loading;
export const selectDeliveryClientsError = (state: RootState) => state.deliveryClients.error;

export const selectVisibleDeliveryClients = createSelector(
  [
    selectVisibleDeliveries,
    (state: RootState) => state.deliveryClients.clientIdsByDeliveryId,
    (state: RootState) => state.deliveryClients.clientById,
  ],
  (visibleDeliveries, clientIdsByDeliveryId, clientById): IFDeliveryClient[] => {
    const seenClientIds = new Set<number>();
    const visibleClients: IFDeliveryClient[] = [];

    for (const delivery of visibleDeliveries) {
      const clientIds = clientIdsByDeliveryId[delivery.id];
      if (!clientIds) continue;

      for (const clientId of clientIds) {
        if (!seenClientIds.has(clientId)) {
          seenClientIds.add(clientId);
          const client = clientById[clientId];
          if (client) {
            visibleClients.push(client);
          }
        }
      }
    }

    return visibleClients;
  }
);

export const selectVisibleDeliveryClientIds = createSelector(
  [selectVisibleDeliveryClients],
  (visibleClients): Set<number> => new Set(visibleClients.map((client) => client.id))
);

export default deliveryClientsSlice.reducer;
