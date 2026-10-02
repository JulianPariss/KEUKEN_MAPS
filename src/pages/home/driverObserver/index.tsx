import { useViewRef } from "../../../utils/hooks/map/useContextRef";
import MapView from "./mapView";
import ListView from "./listView";

const DriverObserver = () => {
    const { view } = useViewRef();

    return (
        <>
            {(view === 'mapView' || view === 'default') && <MapView />}
            {view === 'listView' && <ListView />}
        </>
    );
};

export default DriverObserver;
