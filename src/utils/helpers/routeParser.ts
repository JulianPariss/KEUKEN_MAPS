import type { ILastPositionByPhone, IRoute, ISSERoute } from "../types/sellerObserver/sellers.types";

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

export const lastPositionToRoute = (
    lastPos: ILastPositionByPhone,
    fallbackId: number,
): IRoute => ({
    id: lastPos.id ?? fallbackId,
    lat: Number(lastPos.lat),
    lon: Number(lastPos.lon),
    timestamp: lastPos.timestamp,
    orderCode: lastPos.orderCode ?? null,
    orderType: lastPos.orderType,
    provider: lastPos.provider,
    battery: lastPos.battery,
    collection: lastPos.collection ?? null,
    documentId: lastPos.documentId ?? null,
    deliveryId: lastPos.deliveryId,
});

export const routeToTimestamps = (route: IRoute[]) => {
    const timestamps = route
        .filter(r => r.orderType === -2 || r.deliveryId !== null)
        .map(r => r.timestamp);

    return timestamps;
};