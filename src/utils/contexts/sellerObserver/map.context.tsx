import { createMapContext } from "@repo/map-core";

export const {
    Provider: SellerMapProvider,
    useContext: useMapSellerObserverContext
} = createMapContext([
    'sellerElements',
    'clientElements',
    'historyElements',
    'geozoneElements'
]);
