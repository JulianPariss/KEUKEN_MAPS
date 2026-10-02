import { useCallback, useEffect, useState, type RefObject } from "react";
import { useAppSelector, useAppDispatch } from "../../../../../../store/hooks";
import ExpandibleList from "../../../../../expandableList";
import Empty from "../../../../../empty";
import Item from "./components/item";
import type { IGeoZone } from "../../../../../../utils/types/planner/geozones.types";
import type { IPortfolio } from "../../../../../../utils/types/sellerObserver/portfolios.types";
import { changeAllVisibility } from "../../../../../../store/slices/sellerObserver/portfolioSlice";
import { getPortfolioGeozones } from "../../../../../../services/plannerServices/portfolios.service";
import { fetchHistoryClients } from "../../../../../../store/slices/planner/draftsSlice";
import type { IUseLabel } from "../../../../../../utils/hooks/sidebar/useLabel";
import { useBoxRef } from "../../../../../../utils/hooks/map/useContextRef";
import ClientsFilters from "./components/clientsFilters";
import type { IPorfolioGeozoneRead } from "../../../../../../utils/types/planner/portfolios.types";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
    labels: IUseLabel;
}

const PortfolioSection = (props: IProps) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const { porfolios, watchList, loading } = useAppSelector((state) => state.portfolio)
    const { sellerById } = useAppSelector((state) => state.drafts.sellers);
    const { geozonesById, geozones, watchList: geoWatchlist } = useAppSelector((state) => state.drafts.geozones);

    const { enterprise } = useAppSelector((state) => state.user);
    const { currentDraft } = useAppSelector((state) => state.drafts);


    const [geoPortfolio, setGeoPortfolio] = useState<IPorfolioGeozoneRead[]>([]);
    const [geoParsed, setGeoParsed] = useState<{ [key: number]: { geo: IGeoZone[], pgId: number[] } }>({});
    const [editing, setIsEditing] = useState<number | null>(null);

    const dispatch = useAppDispatch();
    const { OpenBox, UpdateBox, ToggleBox } = useBoxRef();

    useEffect(() => {
        dispatch(changeAllVisibility(true));
    }, [porfolios])

    const getRelevance = (porfolio: IPortfolio) => {
        const search = searchValue.toLowerCase();
        let score = 0;
        if (porfolio.id?.toString().toLowerCase().startsWith(search)) score += 2;
        else if (porfolio.id?.toString().toLowerCase().includes(search)) score += 1;

        if (porfolio.name?.toLowerCase().startsWith(search)) score += 2;
        else if (porfolio.name?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    const filteredPorfolios = [...porfolios]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedPorfolios = filteredPorfolios.filter((porfolio) =>
        watchList.includes(porfolio.id)
    );

    const fetchGeozoneRelations = useCallback(async () => {
        if (enterprise.enterprise_id !== -1 && currentDraft !== -1) {
            dispatch(fetchHistoryClients());
        }
        const parsed = await getPortfolioGeozones(enterprise.enterprise_id, currentDraft)
            .then((res) => {
                setGeoPortfolio(res);
                return res
                    .filter((r) => !r.is_deleted)
                    .reduce<{ [key: number]: { geo: IGeoZone[]; pgId: number[] } }>((acc, relationTable) => {

                        const geoIndx = geozonesById[relationTable.geozone_id];
                        if (geoIndx != null) {
                            const geo = geozones[geoIndx];
                            const pid = relationTable.portfolio_id;
                            acc[pid] ??= { geo: [], pgId: [] };
                            acc[pid].geo.push(geo);
                            acc[pid].pgId.push(relationTable.id);
                        }

                        return acc;
                    }, {});
            });

        setGeoParsed(parsed);
    }, [enterprise.enterprise_id, currentDraft, geozonesById, geozones]);


    useEffect(() => {
        if (enterprise.enterprise_id === -1) return;
        fetchGeozoneRelations();
    }, [enterprise, enterprise.enterprise_id, geozones])


    useEffect(() => {
        if (editing) {
            OpenBox({
                Component: <ClientsFilters labels={props.labels} />
            });
        } 
        UpdateBox( <ClientsFilters labels={props.labels} /> )
    }, [editing, props.labels.activeFilter])

    return (
        <ExpandibleList
            ammountItems={`${porfolios.length}`}
            title="Carteras"
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
            ExtraAction={
                <button
                    onClick={() => ToggleBox({ Component: <ClientsFilters labels={props.labels} /> })}
                    className="text-focus-300 hover:text-focus-100 text-xs font-semibold underline cursor-pointer transition-colors"
                >
                    Ver filtros
                </button>
            }
        >
            <div>
                {filteredPorfolios.length ? (
                    watchedPorfolios.length > 0 ? (
                        watchedPorfolios.map((porfolio) => (
                            <Item
                                labels={props.labels}
                                pgId={geoParsed[porfolio.id]?.pgId ?? null}
                                refresh={fetchGeozoneRelations}
                                draft_id={currentDraft}
                                enterprise_id={enterprise.enterprise_id}
                                geozones={geoParsed[porfolio.id]?.geo ?? null}
                                visibleGeozones={geoWatchlist}
                                key={porfolio.id}
                                porfolio={porfolio}
                                seller={sellerById[porfolio.mobileUser] ?? null}
                                editing={editing}
                                setIsEditing={setIsEditing}
                                geoPortfolio={geoPortfolio}
                            />
                        ))
                    ) : (
                        <Empty text="No existen elementos que cumplan con estos filtros." />
                    )
                ) : (
                    <Empty text="No hay elementos que coincidan con la búsqueda." />
                )}
            </div>
        </ExpandibleList>
    );
};

export default PortfolioSection;