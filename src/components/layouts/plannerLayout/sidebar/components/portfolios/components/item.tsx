import { useEffect, useRef, useState } from "react";
import { useNotifyRef } from "../../../../../../../utils/hooks/map/useContextRef";
import GeozoneSubItem from "./geozoneSubItem";
import ConfirmableButton from "../../../../../../customConfirmableButton";
import type { IGeoZone } from "../../../../../../../utils/types/planner/geozones.types";
import type { ISeller } from "../../../../../../../utils/types/planner/sellers.types";
import { addAllPortfolioGeozones, addPortfolioGeozone, removeAllPortfolioGeozones } from "../../../../../../../services/plannerServices/portfolios.service";
import type { IPortfolio } from "../../../../../../../utils/types/sellerObserver/portfolios.types";
import type { IPorfolioGeozoneCreate, IPorfolioGeozoneCreateBulk, IPorfolioGeozoneRead } from "../../../../../../../utils/types/planner/portfolios.types";
import type { IUseLabel } from "../../../../../../../utils/hooks/sidebar/useLabel";
import { TrashcanIcon } from '@repo/icons';

interface IPorfolioItem {
    porfolio: IPortfolio;
    geozones: IGeoZone[] | null;
    seller: ISeller | null;
    enterprise_id: number;
    refresh: () => void;
    pgId: number[] | null;
    visibleGeozones: number[];
    draft_id: number;
    labels: IUseLabel;
    editing: number | null;
    setIsEditing: (value: number | null) => void;
    geoPortfolio: IPorfolioGeozoneRead[];
}


const Item = (props: IPorfolioItem) => {
    const { porfolio, seller, geozones, enterprise_id, refresh, pgId, visibleGeozones, draft_id, labels, setIsEditing, editing, geoPortfolio } = props;
    const notify = useNotifyRef();
    const ref = useRef<HTMLDivElement>(null);
    const { id, name } = porfolio;

    const [loading, setLoading] = useState<boolean>(false);

    const asignAllGeozones = () => {
        setLoading(true);

        const parsedData: IPorfolioGeozoneCreateBulk = {
            draft_id,
            delivery_zone_id: null,
            geozone_id: visibleGeozones,
            portfolio_id: porfolio.id,
            frecuency: "S",
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
            filter_id: null
        };

        addAllPortfolioGeozones(enterprise_id, parsedData).then((res) => {
            notify(`Se asignaron ${res.length} geo zonas con éxito`, 'SUCCESS');
        }).catch((e) => {
            notify(e.detail, 'ERROR');
        }).finally(() => {
            setLoading(false);
            refresh();
        });
    };


    const geozonesToRemove = geoPortfolio.filter((geoport) => (!geoport.is_deleted && geoport.portfolio_id === porfolio.id && visibleGeozones.includes(geoport.geozone_id))).map((geoport) => geoport.id);

    const removeAllGeozones = () => {
        setLoading(true);
        removeAllPortfolioGeozones(enterprise_id, geozonesToRemove).then(() => {
            notify(`Se eliminaron con éxito ${geozonesToRemove.length} geo zonas de la cartera`, 'INFO');
        }).catch((e) => {
            notify(e.detail, 'ERROR');
        }).finally(() => {
            setLoading(false);
            refresh();
        })

    }

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onDragOver = () => {
            el.style.background = "rgba(255,255,255,0.15)";
        };

        const onLeave = () => {
            el.style.background = "";
        };

        const onDrop = async (e: CustomEvent) => {
            el.style.background = "";

            const parsedData: IPorfolioGeozoneCreate = {
                draft_id,
                delivery_zone_id: null,
                geozone_id: e.detail.id,
                portfolio_id: porfolio.id,
                frecuency: "S",
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false,
                filter_id: labels.activeFilter ?? null,
            };

            addPortfolioGeozone(enterprise_id, parsedData).then(() => {
                notify("Se agrego la geozona a la cartera con éxito", "SUCCESS");
            }).catch((e) => {
                notify(e.detail ?? "Ocurrio un error al vincular la geozona", "ERROR");
            }).finally(() => {
                refresh();
            })
        };

        el.addEventListener("polygon-drag-over", onDragOver as any);
        el.addEventListener("polygon-drop", onDrop as any);
        el.addEventListener("mouseleave", onLeave);

        return () => {
            el.removeEventListener("polygon-drag-over", onDragOver as any);
            el.removeEventListener("polygon-drop", onDrop as any);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, [refresh, labels.activeFilter]);


    const CANADD: boolean = loading || visibleGeozones.length === 0
    const CANREMOVE: boolean = !CANADD && geozonesToRemove.length > 0;

    return (
        <div className="bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl p-3 rounded-dx my-2 border border-main/10 shadow-xs flex flex-col justify-start">
            <h2 className="text-main font-bold text-sm">
                {name} <span className="text-focus-300 text-xs font-mono ml-1 font-semibold">#{id ?? 'No Code'}</span>
            </h2>
            <hr className="w-full border-main/10 my-2" />
            <h2 className="text-main/50 italic text-xs">Vendedor</h2>
            {seller ? (
                <h2 className="text-main font-medium text-xs mt-0.5">
                    {seller.name} <span className="text-focus-300 text-xs font-mono ml-1 font-semibold">#{seller.id}</span>
                </h2>
            ) : (
                <p className="text-main/60 text-xs italic mt-0.5">No tiene un vendedor asignado</p>
            )}
            <hr className="w-full border-main/10 my-2" />
            <div className="flex flex-col gap-y-2">
                <h2 className="text-main/60 italic text-xs font-medium">Geozonas Vinculadas</h2>
                <div
                    ref={ref}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    className="border-dashed w-full p-2.5 rounded-dx bg-primary-500/10 border border-main/20 flex flex-col shadow-inner shadow-black/10"
                >
                    <p className="text-main/60 text-xs font-medium mb-2 py-0.5">Arrastre las geozonas aquí</p>

                    {geozones && !!geozones.length ? (
                        geozones.map((geo, index) => {
                            const totalClients = geoPortfolio.find((geoport) => geoport.geozone_id === geo.id)?.total_clients ?? 0;
                            return (
                                !geo?.is_deleted && (
                                    <GeozoneSubItem
                                        labels={labels}
                                        key={pgId ? pgId[index] : geo.id}
                                        geo={geo}
                                        totalClients={totalClients}
                                        enterprise_id={enterprise_id}
                                        pgId={pgId ? pgId[index] : geo.id}
                                        refresh={refresh}
                                        setIsEditing={setIsEditing}
                                        editing={(pgId ? pgId[index] : null) === editing}
                                    />
                                )
                            );
                        })
                    ) : (
                        <p className="text-main/40 text-xs italic">No tiene ninguna geozona asignada</p>
                    )}
                </div>
                <div className="flex items-center gap-x-1.5 mt-1">
                    <ConfirmableButton
                        hasConfirmation={true}
                        onClick={asignAllGeozones}
                        className={`
                            ${
                                CANADD
                                    ? 'bg-primary-500/20 text-main/30 border border-main/10 cursor-not-allowed'
                                    : 'bg-focus-500 hover:bg-focus-300 text-variant border border-focus-300/50 shadow-xs cursor-pointer'
                            }
                            p-2 rounded-dx w-full transition-all text-xs font-semibold
                        `}
                        disabled={CANADD}
                        text={`¿Está seguro de asignar todas las geozonas (${visibleGeozones.length}) visibles a la cartera?`}
                    >
                        <p className={`text-xs font-medium ${CANADD ? 'text-main/30' : 'text-variant'}`}>
                            Vincular todas las geozonas visibles
                        </p>
                    </ConfirmableButton>
                    <ConfirmableButton
                        hasConfirmation={true}
                        onClick={removeAllGeozones}
                        className={`
                            ${
                                !CANREMOVE
                                    ? 'bg-primary-500/20 text-main/30 border border-main/10 cursor-not-allowed'
                                    : 'bg-error hover:bg-error/80 text-white border border-error/50 shadow-xs cursor-pointer'
                            }
                            p-2 rounded-dx transition-all
                        `}
                        disabled={!CANREMOVE}
                        text={`¿Está seguro de eliminar todas las geozonas (${geozonesToRemove.length}) visibles de la cartera?`}
                    >
                        <TrashcanIcon className={`size-4 ${!CANREMOVE ? 'stroke-main/30' : 'stroke-white'}`} />
                    </ConfirmableButton>
                </div>
            </div>
        </div>
    );
};

export default Item;    
