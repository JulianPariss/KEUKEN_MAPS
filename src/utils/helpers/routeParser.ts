import type { IRoute, ISSERoute } from "../types/sellerObserver/sellers.types";

export const MqttToRoute = (mqttRoute: ISSERoute): IRoute => {
    return {
        id: mqttRoute.userId,
        lat: Number(mqttRoute.lat),
        lon: Number(mqttRoute.lng),
        timestamp: mqttRoute.timestampUTC,
        orderCode: null,
        orderType: mqttRoute.orderType,
        provider: mqttRoute.provider,
        battery: mqttRoute.battery,
        collection: null,
        documentId: null,
        deliveryId: mqttRoute.deliveryId,
    }
}


export const routeToTimestamps = (route: IRoute[]) => {
    const timestamps = route
        .filter(r => r.orderType === -2 || r.deliveryId !== null)
        .map(r => r.timestamp);

    return timestamps;
};