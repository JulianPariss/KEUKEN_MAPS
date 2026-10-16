import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { visitsService } from '@repo/firebase-services';
import type { IFDeliverie, IFVisit } from '@repo/api-contracts/firebase';
import { changeEnterprise } from '../userSlice';
import { changeDate } from '../sidebarSlice';

export const visitDeliveryClientKey = (deliveryId: number | string, clientId: number | string) =>
  `${Number(deliveryId)}_${Number(clientId)}`;

/**
 * En Firestore, visit.clientId puede ser el id del doc del cliente del reparto
 * o el clientId de negocio. Resolvemos contra ambos.
 */
export const resolveVisitForClient = (
  visitByKey: Record<string, IFVisit>,
  deliveryId: number | string,
  client: { id?: number | null; clientId?: number | null }
): IFVisit | null => {
  const byDocId =
    client.id != null ? visitByKey[visitDeliveryClientKey(deliveryId, client.id)] : undefined;
  const byBusinessId =
    client.clientId != null
      ? visitByKey[visitDeliveryClientKey(deliveryId, client.clientId)]
      : undefined;

  if (byDocId && byBusinessId && byDocId !== byBusinessId) {
    if (byDocId.isInRadius && !byBusinessId.isInRadius) return byDocId;
    if (!byDocId.isInRadius && byBusinessId.isInRadius) return byBusinessId;
    const a = byDocId.visitTime ? new Date(byDocId.visitTime).getTime() : 0;
    const b = byBusinessId.visitTime ? new Date(byBusinessId.visitTime).getTime() : 0;
    return a >= b ? byDocId : byBusinessId;
  }

  return byDocId ?? byBusinessId ?? null;
};

export const matchesVisitClient = (
  visitClientId: number,
  client: { id?: number | null; clientId?: number | null }
): boolean =>
  (client.id != null && visitClientId === client.id) ||
  (client.clientId != null && visitClientId === client.clientId);

export interface IVisitsState {
  visits: IFVisit[];
  visitsByDeliveryId: Record<number, IFVisit[]>;
  visitByDeliveryClientKey: Record<string, IFVisit>;
  loading: boolean;
  error: string | null;
}

export type TFetchVisitsByDeliveriesArgs = IFDeliverie[] | void;

export interface IFetchVisitsByDeliveriesResponse {
  visits: IFVisit[];
  visitsByDeliveryId: Record<number, IFVisit[]>;
  visitByDeliveryClientKey: Record<string, IFVisit>;
}

const initialState: IVisitsState = {
  visits: [],
  visitsByDeliveryId: {},
  visitByDeliveryClientKey: {},
  loading: false,
  error: null,
};

export const fetchVisitsByDeliveries = createAsyncThunk<
  IFetchVisitsByDeliveriesResponse,
  TFetchVisitsByDeliveriesArgs,
  { rejectValue: string; state: RootState }
>(
  'visits/fetchVisitsByDeliveries',
  async (argDeliveries, thunkAPI) => {
    const state = thunkAPI.getState();
    const deliveries = argDeliveries ?? state.deliveries.deliveries;
    const enterpriseId = state.user.enterprise?.enterprise_id;

    if (!deliveries || deliveries.length === 0) {
      return {
        visits: [],
        visitsByDeliveryId: {},
        visitByDeliveryClientKey: {},
      };
    }

    const fallbackCompanyId = enterpriseId && enterpriseId !== -1 ? String(enterpriseId) : '';

    try {
      const deliveryResults = await Promise.all(
        deliveries.map(async (delivery) => {
          const companyId = delivery.enterprise || fallbackCompanyId;
          if (!companyId) {
            return { deliveryId: delivery.id, visits: [] as IFVisit[] };
          }

          try {
            const visits = await visitsService.getAllByDelivery({
              companyId,
              deliveryId: delivery.id,
            });
            return { deliveryId: delivery.id, visits: visits ?? [] };
          } catch (error) {
            console.error(`Error al obtener visitas para el reparto ${delivery.id}:`, error);
            return { deliveryId: delivery.id, visits: [] as IFVisit[] };
          }
        })
      );

      const visits: IFVisit[] = [];
      const visitsByDeliveryId: Record<number, IFVisit[]> = {};
      const visitByDeliveryClientKey: Record<string, IFVisit> = {};

      for (const { deliveryId, visits: deliveryVisits } of deliveryResults) {
        visitsByDeliveryId[deliveryId] = deliveryVisits;

        for (const visit of deliveryVisits) {
          visits.push(visit);
          const key = visitDeliveryClientKey(visit.deliveryId || deliveryId, visit.clientId);
          const existing = visitByDeliveryClientKey[key];

          if (!existing) {
            visitByDeliveryClientKey[key] = visit;
            continue;
          }

          // Preferir visita in-radius (metadata/batería); si empatan, la más reciente
          if (visit.isInRadius && !existing.isInRadius) {
            visitByDeliveryClientKey[key] = visit;
            continue;
          }
          if (!visit.isInRadius && existing.isInRadius) {
            continue;
          }

          if (
            visit.visitTime &&
            (!existing.visitTime ||
              new Date(visit.visitTime).getTime() > new Date(existing.visitTime).getTime())
          ) {
            visitByDeliveryClientKey[key] = visit;
          }
        }
      }

      return {
        visits,
        visitsByDeliveryId,
        visitByDeliveryClientKey,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || 'Error al obtener visitas de los repartos en Firestore'
      );
    }
  }
);

export const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    resetVisits: () => initialState,
    setVisits(state, action: PayloadAction<IFetchVisitsByDeliveriesResponse>) {
      state.visits = action.payload.visits;
      state.visitsByDeliveryId = action.payload.visitsByDeliveryId;
      state.visitByDeliveryClientKey = action.payload.visitByDeliveryClientKey;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeEnterprise, () => initialState)
      .addCase(changeDate, () => initialState)
      .addCase(fetchVisitsByDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitsByDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload.visits;
        state.visitsByDeliveryId = action.payload.visitsByDeliveryId;
        state.visitByDeliveryClientKey = action.payload.visitByDeliveryClientKey;
      })
      .addCase(fetchVisitsByDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error desconocido al cargar visitas de los repartos';
      });
  },
});

export const { resetVisits, setVisits } = visitsSlice.actions;

export const selectVisits = (state: RootState) => state.visits.visits;
export const selectVisitsByDeliveryId = (state: RootState) => state.visits.visitsByDeliveryId;
export const selectVisitByDeliveryClientKey = (state: RootState) =>
  state.visits.visitByDeliveryClientKey;
export const selectVisitsLoading = (state: RootState) => state.visits.loading;
export const selectVisitsError = (state: RootState) => state.visits.error;

export default visitsSlice.reducer;
