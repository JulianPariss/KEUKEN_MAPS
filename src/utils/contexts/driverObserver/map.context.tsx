import { createMapContext } from "@repo/map-core";

export const {
    Provider: DriverMapProvider,
    useContext: useMapDriverObserverContext
} = createMapContext([
    'driverElements',
    'geozoneElements',
    'clientElements'
]);
