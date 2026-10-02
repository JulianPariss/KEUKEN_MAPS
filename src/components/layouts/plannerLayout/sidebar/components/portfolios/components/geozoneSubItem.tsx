import { useState } from "react";
import { CalendarIcon, TrashcanIcon, CrossIcon, LoadingIcon, StallIcon } from '@repo/icons';
import { PrittierWeek } from "../../../../../../../utils/constants/utils.constants";
import { notify } from "../../../../../../../utils/helpers/messageHelper";
import type { TWeekCheck } from "../../../../../../../utils/types/general.types";
import ConfirmableButton from "../../../../../../customConfirmableButton";
import type { IGeoZone } from "../../../../../../../utils/types/planner/geozones.types";
import type { IPorfolioGeozoneCreate, IPorfolioGeozoneRead } from "../../../../../../../utils/types/sellerObserver/portfolios.types";
import { getPortfolioGeozone, removePortfolioGeozone, updatePortfolioGeozone } from "../../../../../../../services/plannerServices/portfolios.service";
import { useAppSelector } from "../../../../../../../store/hooks";
import type { IUseLabel } from "../../../../../../../utils/hooks/sidebar/useLabel";
import { useMapCore } from "@repo/map-core";
import CustomSelect from "../../../../../../customSelect";
import { frecuencyEnum, frecuencyLabels } from "../../../../../../../utils/constants/enums.constants";
import CustomDatePicker from "../../../../../../customDatePicker";
import type { CalendarDate } from "@internationalized/date";
import moment from "moment";

const frecuencyOptions = frecuencyEnum.map((val) => ({
    key: val,
    id: val,
    value: val,
    label: frecuencyLabels[val as keyof typeof frecuencyLabels]
}));

interface IProps {
    geo: IGeoZone;
    enterprise_id: number;
    pgId: number | null;
    refresh: () => void;
    labels: IUseLabel;
    editing: boolean;
    setIsEditing: (value: number | null) => void;
    totalClients: number;
}



const GeozoneSubItem = (props: IProps) => {
    const { geo, enterprise_id, pgId, refresh, labels, setIsEditing, editing, totalClients } = props;
    const { clientsFilterList } = useAppSelector((state) => state.tags);
    const { loading: clientsLoading } = useAppSelector((state) => state.drafts.history);

    const { fitCoordinates } = useMapCore();

    const [useFilter, setUseFilter] = useState<boolean>(true);

    const [loadingVisitDays, setLoadingVisitDays] = useState<boolean>(false);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

    const [visitDays, setVisitDays] = useState<TWeekCheck | null>(null);
    const [currentPg, setCurrentPg] = useState<IPorfolioGeozoneRead | null>(null);
    const [frecuency, setFrecuency] = useState<string>("S");
    const [startDate, setStartDate] = useState<CalendarDate | undefined>(undefined);

    const focusOnMap = () => {
        if (geo.coordinates && geo.coordinates.length > 0) {
            fitCoordinates(geo.coordinates as [number, number][]);
        }
    }

    const handleRemove = (id: number | null) => {
        if (!id) return;
        setLoadingDelete(true);
        removePortfolioGeozone(enterprise_id, id).then(() => {
            notify('Se removio con éxito la geozona de la cartera', 'INFO');
        }).catch((e) => {
            notify(e?.detail ?? 'Ocurrio un error al intentar eliminar la geozona de la cartera', 'ERROR');
        }).finally(() => {
            refresh();
            setLoadingDelete(false);
        })
    }

    const cancelEdition = () => {
        setCurrentPg(null);
        setVisitDays(null);
        setIsEditing(null);
        setFrecuency("S");
        setLoadingVisitDays(false);
        setLoadingSubmit(false);
        setLoadingDelete(false);
    }

    const onStartEditing = (index: number | null) => {
        setLoadingVisitDays(true);
        if (index === null) {
            notify('No se encontro la relación', 'ERROR');
            return
        };

        getPortfolioGeozone(enterprise_id, index).then((res) => {
            const visitDays: TWeekCheck = {
                monday: res.monday,
                tuesday: res.tuesday,
                wednesday: res.wednesday,
                thursday: res.thursday,
                friday: res.friday,
                saturday: res.saturday,
                sunday: res.sunday,
            }
            setVisitDays(visitDays);
            setCurrentPg(res);
            setFrecuency((res as any).frecuency || "S");
            res.filter_id ? labels.setActiveFilter(res.filter_id) : null;
        }).catch(() => {
            notify('No se encontro la relación', 'ERROR')
            setCurrentPg(null);
            setVisitDays(null);
        }).finally(() => {
            setLoadingVisitDays(false);
            setIsEditing(index);
        })
    }

    const submitChanges = () => {
        if (!currentPg || !visitDays) return;
        setLoadingSubmit(true);

        const parsedData: Partial<IPorfolioGeozoneCreate> = {
            ...visitDays,
            filter_id: useFilter ? labels.activeFilter : null,
            frecuency: frecuency,
            start_date: moment(startDate?.toString()).format('YYYY-MM-DD'),
        };

        updatePortfolioGeozone(enterprise_id, currentPg.id, parsedData).then(() => {
            notify('Se modificaron los días de visita con éxito', 'SUCCESS');
        }).catch((error) => {
            notify(error?.detail ?? 'No fue posible modificar los días de visita', 'ERROR');
        }).finally(() => {
            setLoadingSubmit(false);
            refresh();
            cancelEdition();
        });
    }

    const filterLabel = clientsFilterList.find((cfl) => cfl.filter_id == labels.activeFilter);

    return (
        <>
            {geo && (
                <div
                    className="flex flex-col p-2 rounded-dx border my-1.5 transition-all shadow-xs"
                    onClick={focusOnMap}
                    style={{
                        backgroundColor: `${geo?.color ?? '#ffffff'}30`,
                        borderColor: `${geo?.color ?? '#ffffff'}80`
                    }}
                >
                    <div key={geo.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <h2 className="text-main font-semibold text-xs capitalize mr-2 truncate">{geo.name}</h2>
                        </div>
                        <div className="flex gap-x-2 items-center">
                            <div className="flex justify-end items-center" title="Clientes asignados a la cartera">
                                <p className="text-main/60 text-xs font-medium mr-0.5">{totalClients ?? 0}</p>
                                <StallIcon className="size-4 p-0.5 fill-focus-100" />
                            </div>
                            {!loadingVisitDays ? (
                                <button
                                    onClick={() => (editing ? cancelEdition() : onStartEditing(pgId))}
                                    className="group size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center cursor-pointer transition-all hover:bg-focus-500"
                                >
                                    <CalendarIcon className="stroke-main group-hover:stroke-variant size-3.5 transition-colors" />
                                </button>
                            ) : (
                                <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4 fill-main" />
                            )}
                            <ConfirmableButton
                                placement="bottom"
                                text="¿Está seguro de que desea eliminar la geo zona de la cartera?"
                                hasConfirmation={true}
                                confirmText="Eliminar"
                                onClick={() => handleRemove(pgId)}
                            >
                                {!loadingDelete && !clientsLoading ? (
                                    <div className="group size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center cursor-pointer transition-all hover:bg-error">
                                        <TrashcanIcon className="stroke-error group-hover:stroke-variant size-3.5 transition-colors" />
                                    </div>
                                ) : (
                                    <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4 fill-error" />
                                )}
                            </ConfirmableButton>
                        </div>
                    </div>
                    {editing && visitDays && (
                        <>
                            <hr className="border-main/10 my-2" />
                            {!loadingVisitDays ? (
                                <div className="flex flex-col gap-y-2 w-full">
                                    <div className="flex justify-between gap-x-1 w-full">
                                        {PrittierWeek.map((day) => {
                                            const isActive = visitDays[day.key];
                                            return (
                                                <div
                                                    className={`
                                                        flex justify-center items-center
                                                        w-7 p-1 rounded-dx cursor-pointer transition-all shadow-xs
                                                        border ${isActive ? 'bg-focus-500 border-focus-300/50 text-variant' : 'bg-primary-900 border-main/15 text-main/60 hover:text-main'}
                                                    `}
                                                    onClick={() =>
                                                        setVisitDays({
                                                            ...visitDays,
                                                            [day.key]: !visitDays[day.key]
                                                        })
                                                    }
                                                    key={day.key}
                                                >
                                                    <p className="text-center text-xs font-semibold capitalize select-none">
                                                        {day.title.slice(0, 2)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center gap-x-1 w-full h-8">
                                        <div className="w-full h-full">
                                            <CustomSelect
                                                options={frecuencyOptions}
                                                value={frecuency}
                                                handleChange={(val) => setFrecuency(val)}
                                                className="bg-primary-900 border border-main/15 rounded-dx !justify-start !px-2 !py-0 h-full !min-h-8 text-xs text-main"
                                                placeholder="Frecuencia"
                                                placement="bottom right"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-left text-xs text-main/70 font-medium">Fecha de próxima visita</p>
                                    <div className="w-full bg-primary-900 rounded-dx text-sm py-0.5 px-1 pr-2 border border-main/15">
                                        <CustomDatePicker
                                            value={startDate}
                                            variant="compact"
                                            handleChange={(inpDate) => inpDate && setStartDate(inpDate)}
                                        />
                                    </div>
                                    <div className="w-full flex justify-end gap-x-1.5 mt-1">
                                        <ConfirmableButton
                                            placement="bottom"
                                            hasConfirmation={true}
                                            className="px-3 py-1.5 bg-focus-500 hover:bg-focus-300 rounded-dx border border-focus-300/50 text-variant cursor-pointer flex items-center justify-center shadow-xs transition-all text-xs font-medium"
                                            text={`¿Está seguro que desea guardar los días de visita y filtros de cliente seleccionados?`}
                                            onClick={submitChanges}
                                        >
                                            {!loadingSubmit ? (
                                                <p className="text-xs text-variant font-medium">Guardar</p>
                                            ) : (
                                                <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-3.5 fill-variant" />
                                            )}
                                        </ConfirmableButton>
                                        <ConfirmableButton
                                            className="p-1.5 bg-primary-900 hover:bg-primary-500/30 rounded-dx border border-main/15 flex items-center justify-center shadow-xs cursor-pointer transition-all"
                                            onClick={cancelEdition}
                                        >
                                            <CrossIcon className="stroke-main size-3.5" />
                                        </ConfirmableButton>
                                    </div>
                                </div>
                            ) : null}
                            <hr className="border-main/10 my-2" />
                            <div className="flex flex-col bg-primary-950/60 p-2 rounded-dx gap-y-1.5 border border-main/10">
                                <p className="text-main/70 text-xs italic font-medium">
                                    {labels.activeFilter ? 'Aplicar a los clientes filtrados' : 'Seleccione el filtro que desee aplicar'}
                                </p>
                                {filterLabel && (
                                    <div
                                        onClick={() => setUseFilter(!useFilter)}
                                        className={`w-full p-1.5 rounded-dx px-3 border cursor-pointer transition-all shadow-xs ${useFilter ? 'bg-focus-500 border-focus-300/50 text-variant' : 'bg-primary-900 border-main/15 text-main/80'
                                            }`}
                                    >
                                        <p className="text-center text-xs font-medium select-none">{filterLabel.filter}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default GeozoneSubItem;
