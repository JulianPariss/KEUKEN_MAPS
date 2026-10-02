import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { useEffect, useRef } from "react";
import { ClearLocalAuth, validateSession } from "../../../../services/auth.service";
import SidebarComponent from "../../components/sidebar";
import { fetchAllTags } from "../../../../store/slices/sellerObserver/tagsSlice";
import { useContextbarContext } from "../../../../utils/contexts/contextbar.context";
import DriverSection from "./components/drivers";
import ClientSection from "./components/clients";
import { fetchDrivers } from "../../../../store/slices/driverObserver/driversSlice";
import { fetchDeliveriesByDrivers, resetDeliveries } from "../../../../store/slices/driverObserver/deliveriesSlice";
import { fetchClientsByDeliveries, resetDeliveryClients } from "../../../../store/slices/driverObserver/clientsSlice";
import { fetchReturnReasons } from "../../../../store/slices/driverObserver/rejectedsSlice";
import { fetchInvoicesByDate } from "../../../../store/slices/driverObserver/invoicesSlice";
import { useViewRef } from "../../../../utils/hooks/map/useContextRef";
import DriversViewList from "./components/listViewComponents/drivers";
import ClientsViewList from "./components/listViewComponents/clients";

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { enterprise } = useAppSelector((state) => state.user);
    const { date } = useAppSelector((state) => state.sidebar);
    const { drivers } = useAppSelector((state) => state.drivers);
    const { deliveries } = useAppSelector((state) => state.deliveries);
    const { close } = useContextbarContext();
    const { view } = useViewRef();

    useEffect(() => {
        if (!(enterprise.enterprise_id === -1)) {
            close();
            validateSession().then(() => {
                dispatch(fetchDrivers());
                dispatch(fetchAllTags());
                dispatch(fetchReturnReasons());
            }).catch(() => {
                dispatch({ type: 'RESET_STORE' })
                ClearLocalAuth();
            })
        }
    }, [dispatch, enterprise, date]);

    useEffect(() => {
        if (enterprise.enterprise_id !== -1) {
            dispatch(fetchInvoicesByDate());
        }
    }, [dispatch, enterprise.enterprise_id]);

    useEffect(() => {
        if (enterprise.enterprise_id !== -1) {
            if (drivers && drivers.length > 0) {
                dispatch(fetchDeliveriesByDrivers());
            } else {
                dispatch(resetDeliveries());
                dispatch(resetDeliveryClients());
            }
        }
    }, [dispatch, drivers, enterprise.enterprise_id, date]);

    useEffect(() => {
        if (enterprise.enterprise_id !== -1) {
            if (deliveries && deliveries.length > 0) {
                dispatch(fetchClientsByDeliveries(deliveries));
            } else {
                dispatch(resetDeliveryClients());
            }
        }
    }, [dispatch, deliveries, enterprise.enterprise_id]);

    return (
        <SidebarComponent sidebarRef={sidebarRef}>
            <div className={`${view === "listView" ? "hidden" : ""}`}>
                <DriverSection sidebarRef={sidebarRef} />
                <ClientSection sidebarRef={sidebarRef} />
            </div>
            <div className={`${view === "listView" ? "" : "hidden"}`}>
                <DriversViewList />
                <ClientsViewList />
            </div>
        </SidebarComponent >
    )
}

export default Sidebar;