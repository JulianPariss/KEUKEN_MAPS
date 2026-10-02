import { useEffect } from "react";
import { useViewRef } from "../../../utils/hooks/map/useContextRef";
import MapView from "./mapView";
import ListView from "./listView";
import { useAppDispatch, useAppSelector } from "./../../../store/hooks";
import { fetchPortfolios } from "./../../../store/slices/sellerObserver/portfolioSlice";

const SellerObserver = () => {
    const dispatch = useAppDispatch();
    const { enterprise_id } = useAppSelector((state) => state.user.enterprise);
    const { view } = useViewRef();

    useEffect(() => {
        if( enterprise_id === -1 ) return;
        dispatch(fetchPortfolios())
    }, [enterprise_id]);

    return (
        <>
            {(view === 'mapView' || view === 'default') && <MapView />}
            {view === 'listView' && <ListView />}
        </>
    )
}

export default SellerObserver;