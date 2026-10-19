import type { IClient, TClientStatus } from "../types/sellerObserver/clients.types";


export const getClientType = (client: IClient): TClientStatus => {
  if (client.hasOrder) return "VISITED";

  const hasNoSaleOrOrderList =
    client.orderListInRadius.length > 0 || client.orderListNotInRadius.length > 0;

  if (hasNoSaleOrOrderList) {
    return client.visited ? "NOSALE" : "NOVISITED";
  }

  if (!client.visited) return "PENDING";

  if (client.visited) return "UNJUSTIFIED";

  return "UNKOWN";
};

export const isVisitedWithoutOrderOrNoSale = (client: IClient): boolean =>
  getClientType(client) === "UNJUSTIFIED";


export const shouldListClientInTimeline = (client: IClient): boolean => {
  const type = getClientType(client);
  return type === "PENDING" || type === "UNJUSTIFIED" || type === "UNKOWN";
};
