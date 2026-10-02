import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IOrder } from "../../utils/types/sellerObserver/sellers.types";
import moment from "moment";
import type { RootState } from "..";
import { getOrders } from "../../services/sellers.service";
import { notify } from "../../utils/helpers/messageHelper";
import { isAbortError } from "../../services";

type IReducedOrders = { [key: number]: IOrder[] | [] }

interface IResponseFetchAllOrders {
  sellerOrders: IReducedOrders;
  clientOrders: IReducedOrders;
}

export const fetchAllOrders = createAsyncThunk<IResponseFetchAllOrders, {}, { rejected: string, state: RootState }>(
  'sellers/orders',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const { enterprise } = state.user;
    const { date } = state.sidebar;


    try {
      if (enterprise.enterprise_id === -1) throw ('Bad company id');

      const sellerOrders: Record<number | string, IOrder[]> = {};
      const clientOrders: Record<number | string, IOrder[]> = {};

      const parsedData = {
        enterprise: enterprise.enterprise_id,
        routeDate: moment(date).format('YYYYMMDD').toString(),
      }

      const response = await getOrders(parsedData);

      response.forEach((orderList) => {
        const sellerId = orderList.mobileUser;
        orderList.orders.forEach(order => {
          const clientId = order.clientData.code;
          if (!sellerOrders[sellerId]) {
            sellerOrders[sellerId] = [];
          }
          sellerOrders[sellerId].push(order);

          if (!clientOrders[clientId]) {
            clientOrders[clientId] = [];
          }
          clientOrders[clientId].push(order);
        });
      })
      return {
        sellerOrders,
        clientOrders
      }
    } catch (error: any) {

      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error', 'ERROR');
      return thunkAPI.rejectWithValue('Failed to fetch orders');
    }
  }
)