import { useEffect, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import ExpandibleList from "../../../../../expandableList";
import CreateGeoZone from "./components/createGeoZone";
import { changeAllVisibility, changeFilteredList, getGeozones } from "../../../../../../store/slices/sellerObserver/geozonesSlice";
import type { IGeoZone } from "../../../../../../utils/types/sellerObserver/geozones.types";
import { useEditPolygonRef, useNotifyRef } from "../../../../../../utils/hooks/map/useContextRef";
import useLabel from "../../../../../../utils/hooks/sidebar/useLabel";
import type { ITag, ITagGroup } from "../../../../../../utils/types/tags.types";
import Label from "../../../../../label";
import CustomConfirmableButton from "../../../../../customConfirmableButton";
import { FilterIcon, NoWatchIcon, TrashcanIcon, WatchIcon } from '@repo/icons';
import Empty from "../../../../../empty";
import Item from "./components/item";
import { canDo } from "../../../../../../utils/permissions/geozone.permissions";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const GeoZones = (props: IProps) => {
    const { sidebarRef } = props;

    const { isEditing, handleStartEditing } = useEditPolygonRef();


    const [isCreating, setIsCreating] = useState<boolean>(false);

    const [searchValue, setSearchValue] = useState<string>('');

    const { enterprise, profile } = useAppSelector((state) => state.user);
    const { geozonesTagList } = useAppSelector((state) => state.tags);
    const { geozones, watchList, filterList, loading } = useAppSelector((state) => state.geo);
    const dispatch = useAppDispatch();
    const notify = useNotifyRef();



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
        getValuesToRender
    } = useLabel();


    const isWatchingGeozones = (): boolean => {
        return watchList.length > 0
    }

    useEffect(() => {
        resetFilters();
        if (enterprise.enterprise_id !== -1) {
            dispatch(getGeozones())
        }
    }, [dispatch, enterprise, enterprise.enterprise_id])


    useEffect(() => {
        const filteredIds = geozones.reduce<number[]>((acc, cl) => {
            const channelMatches = matchesFilters(cl);

            if (channelMatches) {
                acc.push(cl.id);
            }

            return acc;
        }, []);

        dispatch(changeFilteredList(filteredIds));
    }, [geozones, tagsFiltered]);

    const getRelevance = (geozone: IGeoZone) => {
        const search = searchValue.toLowerCase();
        let score = 0;

        if (geozone.name?.toLowerCase().startsWith(search)) score += 2;
        else if (geozone.name?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    const filteredGeozones = [...geozones]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedGeozones = filteredGeozones.filter((geozone) =>
        filterList.includes(geozone.id)
    );

    const LabelList = (gr: ITagGroup | ITag, onlySelecteds: boolean) => {
        return (
            <div key={gr.key} className="flex flex-wrap gap-2">
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
        initGroupTag(geozonesTagList)
    }, [geozonesTagList])

    const isWatched = (id: number): boolean => {
        return watchList.some((wi) => wi === id);
    }

    const handleToggleVisibilities = () => {
        if (isEditing) {
            notify('Para ocultar las Geo Zonas, primero finalice la edición.', 'WARN');
        } else {
            dispatch(changeAllVisibility(!isWatchingGeozones()));
        }
    }

    return (
        <ExpandibleList
            toggleView={isWatchingGeozones()}
            handleToggleVisibilities={handleToggleVisibilities}
            title='Geo Zonas'
            ammountItems={`${filterList.length}/${geozones.length}`}
            setSearchValue={setSearchValue}
            sidebarRef={sidebarRef}
            hasDobleAction={true}
            ExtraAction={
                canDo(
                    profile.permissions,
                    'EDIT'
                ) ?
                    <CreateGeoZone
                        isCreating={isCreating}
                        setIsCreating={setIsCreating}
                    /> :
                    <></>
            }
            isSticky
            isLoading={loading}
        >

            <div className="flex flex-col">
                {geozonesTagList.length > 0 && (
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
                                                        -{geozonesTagList.find((gr) => gr.key === tg.key)?.title ?? '-'}
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
                                    <div className="w-full flex flex-col gap-y-2 gap-x-1">
                                        {geozonesTagList.map((gr) => (
                                            gr.labels.length > 0 ? (
                                                <div key={gr.id} className="bg-primary-500/20 flex flex-wrap rounded-dx p-2 border border-main/10 gap-1.5">
                                                    {LabelList(gr, false)}
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                    <CustomConfirmableButton
                                        onClick={() => { setIsFiltering(!isFiltering); setViewFilters(true); }}
                                        hasConfirmation={false}
                                        className="p-2 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant flex justify-center items-center mt-2 shadow-xs cursor-pointer"
                                    >
                                        <p className="text-variant font-medium mr-2 text-xs">{!isFiltering ? 'Mostrar filtros' : 'Ocultar filtros'}</p>
                                        <FilterIcon className="size-4 fill-variant" />
                                    </CustomConfirmableButton>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {watchedGeozones.length > 0 ? (
                watchedGeozones.map((geo) => (
                    <Item
                        key={geo.id}
                        geo={geo}
                        visibleTags={viewFilters}
                        enterprise_id={enterprise.enterprise_id}
                        isWatched={isWatched(geo.id)}
                        onEdit={handleStartEditing}
                        isEditing={isEditing}
                        isCreating={isCreating}
                        permissions={profile.permissions}
                    />
                ))
            ) : (
                <Empty text="No existen elementos que cumplan con estos filtros." />
            )}
        </ExpandibleList>
    );
};

export default GeoZones;
