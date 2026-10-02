import { useEffect, useState, type RefObject } from "react";
import { useAppSelector, useAppDispatch } from "../../../../../../store/hooks";
import Item from "./components/item";
import { changeAllVisibility, changeOneVisibility, changeFilteredList } from "../../../../../../store/slices/sellerObserver/sellersSlice";
import ExpandibleList from "../../../../../expandableList";
import type { ISeller } from "../../../../../../utils/types/sellerObserver/sellers.types";
import Empty from "../../../../../empty";
import CustomConfirmableButton from "../../../../../customConfirmableButton";
import useLabel from "../../../../../../utils/hooks/sidebar/useLabel";
import { FilterIcon, NoWatchIcon, TrashcanIcon, WatchIcon } from '@repo/icons';
import type { ITag, ITagGroup } from "../../../../../../utils/types/tags.types";
import Label from "../../../../../label";
import { getTotalSelled } from "../../../../../../store/selectors/sellers.selector";
import { formatMoney } from "../../../../../../utils/helpers/formatters";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
    viewMode: string;
}

const SellerSection = (props: IProps) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const { sellers, watchList, onlineStatus, sellerRoutes, filterList, loading } = useAppSelector((state) => state.sellers)

    const totalSelled = useAppSelector(getTotalSelled());

    const { sellersTagList } = useAppSelector((state) => state.tags);

    const isWatchingSellers = (): boolean => {
        return watchList.length > 0
    }


    const dispatch = useAppDispatch();

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
    } = useLabel();

    const isWatched = (id: number): boolean => {
        return watchList.some((wi) => wi === id);
    }

    const changeWatchedState = (id: number) => {
        dispatch(changeOneVisibility(id));
    }

    const handleToggleVisibilities = () => {
        dispatch(changeAllVisibility(!isWatchingSellers()));
    }

    const getRelevance = (seller: ISeller) => {
        const search = searchValue.toLowerCase();
        let score = 0;
        if (seller.seller?.toString().toLowerCase().startsWith(search)) score += 2;
        else if (seller.seller?.toString().toLowerCase().includes(search)) score += 1;

        if (seller.sellerName?.toLowerCase().startsWith(search)) score += 2;
        else if (seller.sellerName?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    const filteredSellers = [...sellers]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedSellers = filteredSellers.filter((seller) =>
        filterList.includes(seller.seller)
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
        const filteredIds = sellers.reduce<number[]>((acc, sel) => {
            const channelMatches = matchesFilters(sel);

            if (channelMatches) {
                acc.push(sel.seller);
            }

            return acc;
        }, []);

        dispatch(changeFilteredList(filteredIds));
    }, [sellers, tagsFiltered]);

    useEffect(() => {
        initGroupTag(sellersTagList);
    }, [sellersTagList]);

    return (
        <ExpandibleList
            handleToggleVisibilities={handleToggleVisibilities}
            toggleView={isWatchingSellers()}
            ammountItems={`${filterList.length}/${sellers.length}`}
            title="Vendedores"
            subtitle={<p className="text-xs text-main/80">Total vendido: <span className="text-focus-300 before:content-['$'] font-bold">{formatMoney(totalSelled)}</span></p>}
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
        >
            <div>
                {sellersTagList.length > 0 && (
                    <div className="p-2.5 bg-primary-950/40 backdrop-blur-xl border border-main/10 my-2 rounded-dx shadow-xs">
                        <div className="flex flex-col">
                            <div className="flex gap-x-2">
                                <CustomConfirmableButton
                                    onClick={() => { setViewFilters(!viewFilters); setIsFiltering(false); }}
                                    className="w-10 p-2 bg-focus-500 hover:bg-focus-300 rounded-dx text-variant transition-colors shadow-xs flex justify-center items-center cursor-pointer"
                                    hasConfirmation={false}>
                                    {viewFilters ? <WatchIcon className="size-4.5 stroke-variant" /> : <NoWatchIcon className="size-4.5 stroke-variant" />}
                                </CustomConfirmableButton>
                                <CustomConfirmableButton
                                    onClick={() => { setIsFiltering(!isFiltering); setViewFilters(true); }}
                                    hasConfirmation={false}
                                    className="p-2 rounded-dx bg-focus-500 hover:bg-focus-300 flex justify-center items-center w-full text-variant transition-colors shadow-xs cursor-pointer">
                                    <p className="text-variant mr-2 text-xs font-semibold">{!isFiltering ? 'Mostrar filtros' : 'Ocultar filtros'}</p>
                                    <FilterIcon className="size-4 fill-variant" />
                                </CustomConfirmableButton>
                                <CustomConfirmableButton
                                    onClick={resetFilters}
                                    className={`w-10 p-2 rounded-dx transition-colors shadow-xs flex justify-center items-center ${tagsFiltered.length > 0 ? 'bg-focus-500 hover:bg-focus-300 text-variant cursor-pointer' : 'bg-focus-500/30 opacity-40 text-variant cursor-not-allowed'}`}
                                    hasConfirmation={false}>
                                    <TrashcanIcon className="size-4.5 stroke-variant" />
                                </CustomConfirmableButton>
                            </div>
                            {!isFiltering && viewFilters && (
                                <div className="flex flex-col w-full gap-y-2 mt-2">
                                    <div className="flex flex-col gap-y-1.5 gap-x-1 bg-none">
                                        {!!tagsFiltered.length ? (
                                            tagsFiltered.map((tg) => {
                                                return (
                                                    <div key={tg.key} className="flex flex-col gap-y-1">
                                                        <h3 className="text-main/70 italic text-xs ml-1">
                                                            -{sellersTagList.find((gr) => gr.key === tg.key)?.title ?? '-'}
                                                        </h3>
                                                        <div className="bg-primary-500/20 border border-main/10 flex flex-wrap rounded-dx p-2">
                                                            {LabelList(tg, true)}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <Empty className="!rounded-dx !text-xs !p-2.5" text="Aún no seleccionaste ningún filtro." />
                                        )}
                                    </div>
                                </div>
                            )}
                            {isFiltering && viewFilters && (
                                <div className="w-full flex flex-col mt-2">
                                    <div className="w-full flex flex-col gap-y-2 gap-x-1">
                                        {sellersTagList.map((gr) => {
                                            return gr.labels.length > 0 ? (
                                                <div key={gr.id} className="bg-primary-500/20 border border-main/10 flex flex-wrap rounded-dx p-2.5">
                                                    {LabelList(gr, false)}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                    <CustomConfirmableButton
                                        onClick={() => { setIsFiltering(!isFiltering); setViewFilters(true); }}
                                        hasConfirmation={false}
                                        className="p-2 rounded-dx bg-focus-500 hover:bg-focus-300 flex justify-center items-center mt-2 w-full text-variant transition-colors shadow-xs cursor-pointer">
                                        <p className="text-variant mr-2 text-xs font-semibold">{!isFiltering ? 'Mostrar filtros' : 'Ocultar filtros'}</p>
                                        <FilterIcon className="size-4 fill-variant" />
                                    </CustomConfirmableButton>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {filteredSellers.length ? (
                    watchedSellers.length > 0 ? (
                        watchedSellers
                            .map((seller) => (
                                <Item
                                    sidebarRef={props.sidebarRef}
                                    viewMode={props.viewMode}
                                    visibleTags={viewFilters}
                                    key={seller.seller}
                                    isWatched={isWatched(seller.seller)}
                                    watchList={watchList}
                                    status={onlineStatus[seller.seller]}
                                    changeWatchedState={changeWatchedState}
                                    routes={sellerRoutes.routes[seller.seller]}
                                    {...seller}
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

export default SellerSection;
