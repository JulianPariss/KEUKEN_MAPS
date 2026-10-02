import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { useEffect, useRef } from "react";
import SellerSection from "./components/sellers";
import { fetchAllLocationHistory, fetchGps, fetchSellers } from "../../../../store/slices/sellerObserver/sellersSlice";
import GeoZones from "./components/geoZones";
import { fetchClients } from "../../../../store/slices/sellerObserver/clientsSlice";
import { ClearLocalAuth, validateSession } from "../../../../services/auth.service";
import SidebarComponent from "../../components/sidebar";
import { fetchAllTags } from "../../../../store/slices/sellerObserver/tagsSlice";
import { useContextbarContext } from "../../../../utils/contexts/contextbar.context";
import ClientsViewList from "./components/listViewComponents/clients";
import { useViewRef } from "../../../../utils/hooks/map/useContextRef";
import { fetchAllSellersStats } from "../../../../store/slices/sellerObserver/statsSlice";
import { fetchAllOrders } from "../../../../store/sharedThunks";
import { fetchHistoryClients } from "../../../../store/slices/sellerObserver/historySlice";
import SellersViewList from "./components/listViewComponents/sellers";

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const { enterprise } = useAppSelector((state) => state.user);
    const { date } = useAppSelector((state) => state.sidebar);
    const { sellers } = useAppSelector((state) => state.sellers);

    const { close } = useContextbarContext();

    const { view } = useViewRef();

    useEffect(() => {
        if (!(enterprise.enterprise_id === -1)) {
            close();
            validateSession().then(() => {
                dispatch(fetchSellers({ enterprise_id: enterprise.enterprise_id, routeDate: date.toString() }));
                dispatch(fetchClients({}));
                dispatch(fetchAllTags());
            }).catch(() => {
                dispatch({ type: 'RESET_STORE' })
                ClearLocalAuth();
            })
        }
    }, [dispatch, enterprise, date])

    useEffect(() => {
        if (enterprise.enterprise_id !== -1) {
            dispatch(fetchHistoryClients({
                days: null
            }));
        }
    }, [dispatch, enterprise])

    useEffect(() => {
        if (enterprise.enterprise_id === -1 || sellers.length === 0) return

        dispatch(fetchAllLocationHistory({}));
        dispatch(fetchAllOrders({}));
        dispatch(fetchGps({}));


        if (sellers.length > 0) dispatch(fetchAllSellersStats({ sellersIds: sellers.map((s) => s.seller) }))

    }, [date, sellers, enterprise.enterprise_id])

    return (
        <SidebarComponent sidebarRef={sidebarRef}>
            <div className={`${view === "listView" ? "hidden" : ""}`}>
                {/*  <StatusBanner tagsFiltered={labels.tagsFiltered} activeFilter={labels.activeFilter} /> */}
                {/*                 <Clients /> */}
                <SellerSection sidebarRef={sidebarRef} viewMode={view} />
                <GeoZones sidebarRef={sidebarRef} key={"geozone-listView"} />
            </div>
            <div className={`${view === "listView" ? "" : "hidden"}`}>
                <ClientsViewList />
                <SellersViewList />
            </div>
        </SidebarComponent >
    )
}

export default Sidebar;