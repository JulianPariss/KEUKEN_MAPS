import { useEffect, useState, type RefObject } from "react";
import { useAppSelector, useAppDispatch } from "../../../../../../store/hooks";
import Item from "./components/item";
import { fetchGps } from "../../../../../../store/slices/sellerObserver/sellersSlice";
import ExpandibleList from "../../../../../expandableList";
import { fetchAllOrders } from "../../../../../../store/sharedThunks";
import Empty from "../../../../../empty";
import type { ISeller } from "../../../../../../utils/types/planner/sellers.types";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const SellerSection = (props: IProps) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const { sellers: sellersSlice } = useAppSelector((state) => state.drafts);
    const { sellers, loading } = sellersSlice;
    const { enterprise } = useAppSelector((state) => state.user);
    const { date } = useAppSelector((state) => state.sidebar);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (enterprise.enterprise_id === -1) return
        dispatch(fetchAllOrders({}));
        dispatch(fetchGps({}));

    }, [date, sellers, enterprise.enterprise_id])

    const getRelevance = (seller: ISeller) => {
        const search = searchValue.toLowerCase();
        let score = 0;
        if (seller.id?.toString().toLowerCase().startsWith(search)) score += 2;
        else if (seller.id?.toString().toLowerCase().includes(search)) score += 1;

        if (seller.name?.toLowerCase().startsWith(search)) score += 2;
        else if (seller.name?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    const filteredSellers = [...sellers]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedSellers = filteredSellers;

    return (
        <ExpandibleList
            ammountItems={`${sellers.length}`}
            title="Vendedores"
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
        >
            <div>
                {filteredSellers.length ?
                    watchedSellers.length > 0 ? (
                        watchedSellers
                            .map((seller) => (
                                <Item
                                    sidebarRef={props.sidebarRef}
                                    key={seller.id}
                                    {...seller}
                                />
                            ))) : (
                        <Empty text="No existen elementos que cumplan con estos filtros." />
                    )
                    : <Empty text="No hay elementos que coincidan con la búsqueda." />}
            </div>
        </ExpandibleList>

    )
}

export default SellerSection;