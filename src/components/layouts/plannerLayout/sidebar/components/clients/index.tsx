import { useEffect, useState, type RefObject } from "react";
import { Virtuoso } from "react-virtuoso"
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import Item from "./components/item";
import ExpandibleList from "../../../../../expandableList";
import { type IDayState, type IHistoryClient, type THistoryDayKey } from "../../../../../../utils/types/sellerObserver/history.types";
import Empty from "../../../../../empty";
import { useCreatePath } from "@repo/map-core";
import { useMapPlannerContext, useModalRef, useNotifyRef } from "../../../../../../utils/hooks/map/useContextRef";
import { CheckOutlinedIcon, CrossOutlinedIcon, FilterIcon, MarkAddIcon, MarkSubsIcon, NoWatchIcon, PencilIcon, TrashcanIcon, WatchIcon } from '@repo/icons';
import CustomConfirmableButton from "../../../../../customConfirmableButton";
import type { ITag, ITagGroup } from "../../../../../../utils/types/tags.types";
import { addNewClientFilter, removeClientFilter } from "../../../../../../store/slices/sellerObserver/tagsSlice";
import { type IUseLabel } from "../../../../../../utils/hooks/sidebar/useLabel";
import Label from "../../../../../label";
import NewFilterModal from "./components/newFilterModal";
import { createNewFilter, editFilter, removeFilter } from "../../../../../../services/filters.service";
import type { IFilterPack } from "../../../../../../utils/types/sellerObserver/filters.types";
import RemoveFilterModal from "./components/removeFilterModal";
import { changeAllVisibility, changeFilteredList } from "../../../../../../store/slices/planner/draftsSlice";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
    labels: IUseLabel;
}


const INITIAL_DAYS_STATE: IDayState = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
    unknow: true,
};

const ClientSection = (props: IProps) => {
    const dispatch = useAppDispatch();
    const notify = useNotifyRef();
    const { historyElements, mapRef } = useMapPlannerContext();
    const [searchValue, setSearchValue] = useState<string>('');
    const { focusOnMarker } = useCreatePath({ mapRef });
    const { clients, loading, filterList, watchList } = useAppSelector((state) => state.drafts.history);
    const { currentDraft } = useAppSelector((state) => state.drafts);
    const { enterprise } = useAppSelector((state) => state.user);
    const { clientsTagList, clientsFilterList } = useAppSelector((state) => state.tags);

    const [filteredPrev, setFilteredPrev] = useState<number | null>(null);

    const [filterEdit, setFilterEdit] = useState<IFilterPack | null>(null);

    const { OpenModal } = useModalRef();

    const {
        tagsFiltered,
        setTagsFiltered,
        resetFilters,
        matchesFilters,
        isFiltering,
        setIsFiltering,
        viewFilters,
        setViewFilters,
        initGroupTag,
        getValuesToRender,
        setActiveFilter,
        activeFilter,
        canCreateFilter,
    } = props.labels;


    const daysOfWeek: THistoryDayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'unknow'];

    const [daysFiltered, setDaysFiltered] = useState<IDayState>(INITIAL_DAYS_STATE);
    const visible = watchList.length > 0;


    const handleToggleVisibilities = () => {
        dispatch(changeAllVisibility({
            opp: !visible,
            group: "history"
        }))
    }

    const isOnSomeDay = (cl: IHistoryClient) => {
        return (
            (daysFiltered.monday && cl.monday) ||
            (daysFiltered.tuesday && cl.tuesday) ||
            (daysFiltered.wednesday && cl.wednesday) ||
            (daysFiltered.thursday && cl.thursday) ||
            (daysFiltered.friday && cl.friday) ||
            (daysFiltered.saturday && cl.saturday) ||
            (daysFiltered.sunday && cl.sunday)
        )
    }

    const noHaveDay = (cl: IHistoryClient) => {
        return !(cl.monday || cl.tuesday || cl.wednesday || cl.thursday || cl.friday || cl.saturday || cl.sunday);
    }

    const DayButton = (props: { day: THistoryDayKey }) => {
        const { day } = props;
        const changeFilterValue = () => {
            const newFilters = daysFiltered;
            newFilters[day] = !newFilters[day];
            setDaysFiltered({ ...newFilters });
        };

        const buttonLabel: Record<THistoryDayKey, { label: string }> = {
            monday: { label: 'Lu' },
            tuesday: { label: 'Ma' },
            wednesday: { label: 'Mi' },
            thursday: { label: 'Ju' },
            friday: { label: 'Vi' },
            saturday: { label: 'Sa' },
            sunday: { label: 'Do' },
            unknow: { label: '-' }
        };

        const isDayActive = daysFiltered[day];

        return (
            <div
                onClick={changeFilterValue}
                className={`size-7 rounded-dx shadow-xs cursor-pointer flex justify-center items-center font-medium text-xs transition-all border ${isDayActive
                        ? 'bg-focus-500 text-variant border-focus-300/50 shadow-focus-500/20 font-bold'
                        : 'bg-primary-500/20 border-main/15 text-main/50 hover:text-main/80'
                    }`}
            >
                <p className="select-none">{buttonLabel[day].label}</p>
            </div>
        );
    };

    const getRelevance = (client: IHistoryClient) => {
        const search = searchValue.toLowerCase();
        let score = 0;
        if (client.id?.toString().toLowerCase() === search) score += 4;
        else if (client.id?.toString().toLowerCase().startsWith(search)) score += 3;
        else if (client.id?.toString().toLowerCase().includes(search)) score += 1;

        if (client.name?.toLowerCase().startsWith(search)) score += 2;
        else if (client.name?.toLowerCase().includes(search)) score += 1;

        if (client.address?.toLowerCase().startsWith(search)) score += 1;
        else if (client.address?.toLowerCase().includes(search)) score += 0.5;

        return score;
    };

    useEffect(() => {
        if (enterprise.enterprise_id === -1) return;
        resetFilters();
        setDaysFiltered({
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            unknow: true,
        });
        dispatch(changeAllVisibility({ opp: false, group: 'history' }));
    }, [enterprise.enterprise_id, enterprise]);

    const filteredClients = [...clients]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedClients = filteredClients.filter((client) =>
        filterList.includes(client.id)
    );

    const LabelList = (gr: ITagGroup | ITag, onlySelecteds: boolean) => {
        return (
            <div key={gr.key} className="flex flex-wrap gap-1.5">
                {getValuesToRender(gr, onlySelecteds).map((tg) => (
                    <Label
                        key={`${gr.key}-${tg}`}
                        tag={tg}
                        groupKey={gr.key}
                        tagsFiltered={tagsFiltered}
                        setTagsFiltered={setTagsFiltered}
                    >
                        {tg}
                    </Label>
                ))}
            </div>
        );
    };

    useEffect(() => {
        const filteredIds = clients.reduce<number[]>((acc: number[], cl: IHistoryClient) => {
            const inSomeDay = isOnSomeDay(cl);
            const inUnknownDay = daysFiltered.unknow && noHaveDay(cl);

            const channelMatches = matchesFilters(cl);

            if ((inSomeDay || inUnknownDay) && channelMatches) {
                acc.push(cl.id);
            }

            return acc;
        }, []);

        dispatch(changeFilteredList({ wl: filteredIds, group: 'history' }));
    }, [daysFiltered, clients, tagsFiltered]);

    const isFilterActive = (filter: IFilterPack): boolean => {
        const a = tagsFiltered;
        const b = filter.tag;

        if (a.length !== b.length) return false;

        return a.every(tagA => {
            const tagB = b.find(t => t.key === tagA.key);
            if (!tagB) return false;
            if (tagA.labels.length !== tagB.labels.length) return false;

            return tagA.labels.every(l => tagB.labels.includes(l));
        });
    };

    useEffect(() => {
        const active = clientsFilterList.find((f: IFilterPack) => isFilterActive(f)) || null;
        if (!filterEdit) {
            setActiveFilter(active?.filter_id ?? null);
        }
    }, [tagsFiltered, clientsFilterList]);

    useEffect(() => {
        if (!activeFilter) return;
        setFilterEdit(null);
    }, [activeFilter]);

    useEffect(() => {
        initGroupTag(clientsTagList);
    }, [clientsTagList]);

    const onCreationSubmit = (value: { filtername: string }): void => {
        setFilterEdit(null);
        setFilteredPrev(null);

        createNewFilter(enterprise.enterprise_id, {
            name: value.filtername,
            tag: tagsFiltered
        }).then((res) => {
            dispatch(addNewClientFilter(res));
            notify(`Se creó el filtro ${value.filtername} con éxito`, 'SUCCESS');
        });
    };

    const onRemoveSubmit = (): void => {
        setFilterEdit(null);
        setFilteredPrev(null);

        if (!activeFilter) return;
        removeFilter(enterprise.enterprise_id, activeFilter).then((res) => {
            dispatch(removeClientFilter(res.id));
            notify(`Se eliminó el filtro ${res.name} con éxito`, 'WARN');
        });
    };

    const onEditionSubmit = (value: { filtername: string }): void => {
        if (!filterEdit) return;
        editFilter(enterprise.enterprise_id, filterEdit.filter_id, { ...filterEdit, name: value.filtername, tag: tagsFiltered }).then((res) => {
            dispatch(addNewClientFilter(res));
            notify(`Se editó el filtro ${res.filter} con éxito`, 'SUCCESS');
        }).finally(() => {
            setFilterEdit(null);
            setFilteredPrev(null);
        });
    };

    const CANADDFILTER = canCreateFilter() && !!!activeFilter;
    const CANREMOVEFILTER = activeFilter;
    const CANEDIT = activeFilter;

    const filter = clientsFilterList.find((cfl) => cfl.filter_id == activeFilter) ?? null;

    useEffect(() => {
        dispatch(changeAllVisibility({
            opp: false,
            group: "history"
        }));
    }, [currentDraft]);

    return (
        <ExpandibleList
            title="Clientes"
            handleToggleVisibilities={handleToggleVisibilities}
            toggleView={visible}
            ammountItems={`${filterList.length}/${clients.length}`}
            hasDobleAction={true}
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
        >
            <div className="flex flex-col">
                <div className="p-2.5 bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx my-2 shadow-xs">
                    <div className="flex flex-col">
                        <div className="flex gap-x-2">
                            <CustomConfirmableButton
                                onClick={() => { setViewFilters(!viewFilters); setIsFiltering(false); }}
                                className="w-10 p-2 bg-focus-500 hover:bg-focus-300 rounded-dx text-variant transition-all shadow-xs flex items-center justify-center cursor-pointer"
                                hasConfirmation={false}
                            >
                                {viewFilters ? <WatchIcon className="size-4.5 stroke-variant" /> : <NoWatchIcon className="size-4.5 stroke-variant" />}
                            </CustomConfirmableButton>
                            <CustomConfirmableButton
                                onClick={() => { setIsFiltering(!isFiltering); setViewFilters(true); }}
                                hasConfirmation={false}
                                className="p-2 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant flex justify-center items-center w-full transition-all shadow-xs cursor-pointer"
                            >
                                <p className="text-variant font-medium mr-2 text-xs">{!isFiltering ? 'Mostrar filtros' : 'Ocultar filtros'}</p>
                                <FilterIcon className="size-4 fill-variant" />
                            </CustomConfirmableButton>
                            <CustomConfirmableButton
                                disabled={!!!tagsFiltered.length}
                                onClick={resetFilters}
                                className={`w-10 p-2 rounded-dx transition-all shadow-xs flex items-center justify-center cursor-pointer ${tagsFiltered.length > 0 ? 'bg-focus-500 hover:bg-focus-300 text-variant' : 'bg-focus-500/35 text-variant/50'}`}
                                hasConfirmation={false}
                            >
                                <TrashcanIcon className={`size-4.5 ${tagsFiltered.length > 0 ? 'stroke-variant' : 'stroke-variant/50'}`} />
                            </CustomConfirmableButton>
                        </div>
                        {!isFiltering && viewFilters && (
                            <div className="flex flex-col w-full gap-y-2 mt-2">
                                <div className="flex flex-col gap-y-1.5 gap-x-1 bg-none">
                                    {!!tagsFiltered.length ? (
                                        tagsFiltered.map((tg) => (
                                            <div key={tg.key}>
                                                <h3 className="text-main/80 italic text-xs ml-1 font-medium">
                                                    -{clientsTagList.find((gr) => gr.key === tg.key)?.title ?? '-'}
                                                </h3>
                                                <div className="bg-primary-500/20 flex flex-wrap rounded-dx p-2 border border-main/10 gap-1.5 mt-1">
                                                    {LabelList(tg, true)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <Empty className="!rounded-dx !text-xs !p-2" text="Aún no seleccionaste ningún filtro." />
                                    )}
                                </div>
                            </div>
                        )}
                        {isFiltering && viewFilters && (
                            <div className="w-full flex flex-col mt-2">
                                <div className="w-full flex justify-between items-center mb-2 gap-1">
                                    {daysOfWeek.map((day) => (
                                        <DayButton day={day} key={day} />
                                    ))}
                                </div>
                                <div className="w-full flex flex-col gap-y-2 gap-x-1">
                                    <div className="bg-primary-500/20 rounded-dx p-2.5 flex flex-col border border-main/10">
                                        <div className="w-full flex justify-between items-center mb-2">
                                            <p className="text-xs text-main/60 font-semibold italic">Filtros</p>
                                            <div className="flex gap-x-1.5 items-center">
                                                {!filterEdit ? (
                                                    <PencilIcon
                                                        className={`size-4 ${CANEDIT ? 'stroke-main hover:stroke-focus-300 cursor-pointer' : 'stroke-main/30 cursor-not-allowed'}`}
                                                        onClick={() => {
                                                            setFilteredPrev(activeFilter ? activeFilter : null);
                                                            setFilterEdit(filter);
                                                        }}
                                                    />
                                                ) : (
                                                    <>
                                                        <CheckOutlinedIcon
                                                            className="size-4 stroke-focus-300 cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => {
                                                                !isFilterActive(filterEdit)
                                                                    ? OpenModal({
                                                                        Component: <NewFilterModal defaultValue={filterEdit.filter} onModalSubmit={onEditionSubmit} />,
                                                                        isRequired: false,
                                                                    })
                                                                    : notify("Ya existe un filtro con las mismas etiquetas", 'WARN');
                                                            }}
                                                        />
                                                        <CrossOutlinedIcon
                                                            className="size-4 stroke-error cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => {
                                                                setFilterEdit(null);
                                                                setFilteredPrev(null);
                                                            }}
                                                        />
                                                    </>
                                                )}
                                                <MarkSubsIcon
                                                    className={`size-3.5 ${CANREMOVEFILTER ? 'fill-main hover:fill-error cursor-pointer' : 'fill-main/30 cursor-not-allowed'}`}
                                                    onClick={() => {
                                                        CANREMOVEFILTER
                                                            ? OpenModal({
                                                                Component: <RemoveFilterModal filterName={filter?.filter ?? ''} onModalSubmit={onRemoveSubmit} />,
                                                                isRequired: false,
                                                            })
                                                            : null;
                                                    }}
                                                />
                                                <MarkAddIcon
                                                    className={`size-3.5 ${CANADDFILTER ? 'fill-main hover:fill-focus-300 cursor-pointer' : 'fill-main/30 cursor-not-allowed'}`}
                                                    onClick={() => {
                                                        CANADDFILTER
                                                            ? OpenModal({
                                                                Component: <NewFilterModal onModalSubmit={onCreationSubmit} />,
                                                                isRequired: false,
                                                            })
                                                            : null;
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <hr className="w-full mb-2 border-main/10" />
                                        <div className="flex flex-wrap gap-1.5">
                                            {clientsFilterList.map((filter) => {
                                                const isActive = isFilterActive(filter);
                                                return (
                                                    <div
                                                        key={filter.filter_id}
                                                        onClick={() => { isActive ? setTagsFiltered([]) : setTagsFiltered(filter.tag); }}
                                                        className={`p-1 px-2.5 rounded-dx cursor-pointer border text-xs font-medium transition-all shadow-xs ${filteredPrev
                                                                ? filteredPrev === filter.filter_id
                                                                    ? 'bg-focus-500/30 border-focus-300 text-focus-300'
                                                                    : 'bg-primary-900 border-main/15 text-main/70'
                                                                : isActive
                                                                    ? 'bg-focus-500 border-focus-300/50 text-variant'
                                                                    : 'bg-primary-900 border-main/15 text-main/80 hover:text-main'
                                                            }`}
                                                    >
                                                        <p className="text-center select-none">{filter.filter}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {clientsTagList.map((gr) => (
                                        gr.labels.length > 0 ? (
                                            <div key={gr.id} className="bg-primary-500/20 flex flex-wrap rounded-dx p-2 border border-main/10 gap-1.5">
                                                {LabelList(gr, false)}
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                                <div className="flex gap-x-2 items-center w-full mt-2">
                                    <CustomConfirmableButton
                                        onClick={() => { setIsFiltering(!isFiltering); setViewFilters(true); }}
                                        hasConfirmation={false}
                                        className="p-2 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant flex justify-center items-center w-full shadow-xs cursor-pointer"
                                    >
                                        <p className="text-variant font-medium mr-2 text-xs">{!isFiltering ? 'Mostrar filtros' : 'Ocultar filtros'}</p>
                                        <FilterIcon className="size-4 fill-variant" />
                                    </CustomConfirmableButton>
                                    <CustomConfirmableButton
                                        onClick={() => {
                                            OpenModal({
                                                Component: <NewFilterModal onModalSubmit={onCreationSubmit} />,
                                                isRequired: false,
                                            });
                                        }}
                                        disabled={!CANADDFILTER}
                                        className="p-2.5 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant flex justify-center items-center shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <MarkAddIcon className="size-4 fill-variant" />
                                    </CustomConfirmableButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {filteredClients.length ? (
                watchedClients.length > 0 ? (
                    <Virtuoso
                        style={{ height: '350px', width: '100%' }}
                        data={watchedClients}
                        itemContent={(_, client) => (
                            <Item
                                visibleTags={viewFilters}
                                onClick={() => {
                                    visible
                                        ? focusOnMarker({
                                            id: client.id,
                                            target: historyElements,
                                            markerMapRef: "sellPointMarkers"
                                        })
                                        : notify('Actualmente no se encuentra visualizando los clientes.', 'WARN');
                                }}
                                key={client.id}
                                {...client}
                            />
                        )}
                    />
                ) : (
                    <Empty text="No existen elementos que cumplan con estos filtros." />
                )
            ) : (
                <Empty text="No hay elementos que coincidan con la búsqueda." />
            )}
        </ExpandibleList>
    )
}

export default ClientSection;
