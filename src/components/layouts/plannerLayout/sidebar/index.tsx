import { useEffect, useRef } from "react";
import SidebarComponent from "../../components/sidebar";
import Card from "../../../card";
import DraftSection from "./components/drafts";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { changeCurrentDraft, fetchDrafts, fetchHistoryClients, fetchSellers, getGeozones, resetGeozone } from "../../../../store/slices/planner/draftsSlice";
import GeoZones from "./components/geoZones";
import SellerSection from "./components/sellers";
import ClientSection from "./components/clients";
import { fetchAllDraftTags } from "../../../../store/slices/sellerObserver/tagsSlice";
import Empty from "../../../empty";
import PortfolioSection from "./components/portfolios";
import { fetchPortfolios } from "../../../../store/slices/sellerObserver/portfolioSlice";
import useLabel from "../../../../utils/hooks/sidebar/useLabel";
import StatusBanner from "../../components/clientsStatus/statusBanner";
import { useViewRef } from "../../../../utils/hooks/map/useContextRef";
import ClientsViewList from "./listView/clients";

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const { enterprise } = useAppSelector((state) => state.user);
    const { currentDraft } = useAppSelector((state) => state.drafts);

    const { view } = useViewRef();


    const sidebarRef = useRef<HTMLDivElement>(null);



    const labels = useLabel();

    useEffect(() => {
        if (enterprise.enterprise_id !== -1) {
            dispatch(fetchDrafts({}));
        }
    }, [dispatch, enterprise])

    useEffect(() => {
        if (enterprise.enterprise_id === -1) return;
        dispatch(fetchSellers());
        dispatch(fetchAllDraftTags());
        dispatch(fetchPortfolios());
    }, [dispatch, enterprise.enterprise_id])

    useEffect(() => {
        if (enterprise.enterprise_id !== -1 && currentDraft !== -1) {
            dispatch(fetchHistoryClients());
        }
    }, [dispatch, enterprise, currentDraft])

    useEffect(() => {
        dispatch(resetGeozone());
        if (currentDraft !== -1) {
            dispatch(getGeozones());
        };
    }, [dispatch, currentDraft])

    return (
        <SidebarComponent sidebarRef={sidebarRef}>
            <Card title="Planificador">
                <p className="text-main/70 text-xs mt-0.5">Aquí podrá crear y aplicar borradores.</p>
            </Card>
            <DraftSection
                sidebarRef={sidebarRef}
                currentDraft={currentDraft}
                setCurrentDraft={(val: number) => dispatch(changeCurrentDraft(val))}
            />
            {currentDraft !== -1 ? (
                <>
                    <div className={`${view === "listView" ? "hidden" : ""}`}>
                        <SellerSection sidebarRef={sidebarRef} />
                        <GeoZones sidebarRef={sidebarRef} />
                        <StatusBanner tagsFiltered={labels.tagsFiltered} activeFilter={labels.activeFilter} />
                        <ClientSection sidebarRef={sidebarRef} labels={labels} />
                        <PortfolioSection sidebarRef={sidebarRef} labels={labels} />
                    </div>
                    <div className={`${view === "listView" ? "" : "hidden"}`}>
                        <ClientsViewList />
                    </div>
                </>
            ) : (
                <Empty className="!h-[90px] !rounded-dx mt-2 border border-main/10" text="Para comenzar seleccione o cree un borrador" />
            )}
        </SidebarComponent>
    );
};

export default Sidebar;