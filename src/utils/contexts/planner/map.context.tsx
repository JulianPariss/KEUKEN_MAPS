import { createMapContext } from "@repo/map-core";

export const {
    Provider: PlannerMapProvider,
    useContext: useMapPlannerContext
} = createMapContext([
    'historyElements',
    'geozoneElements'
]);
