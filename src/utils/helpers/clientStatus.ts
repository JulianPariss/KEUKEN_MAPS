import type { IClient, TClientStatus } from "../types/sellerObserver/clients.types";


export const getClientType = (client: IClient): TClientStatus => {
  if (client.hasOrder) return "VISITED";

  if (client.orderListInRadius.length || client.orderListNotInRadius.length)
    return client.visited ? "NOSALE" : "NOVISITED";

  if (!client.visited) return "PENDING";

  return "UNKOWN";
}

