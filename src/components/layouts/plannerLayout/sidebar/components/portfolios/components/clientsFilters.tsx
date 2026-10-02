import { useAppSelector } from "../../../../../../../store/hooks";
import type { IUseLabel } from "../../../../../../../utils/hooks/sidebar/useLabel";
import type { IFilterPack } from "../../../../../../../utils/types/sellerObserver/filters.types";

interface IProps {
    labels: IUseLabel;
}



const ClientsFilters = (props: IProps) => {
    const { clientsFilterList } = useAppSelector((state) => state.tags);
    const {
        setTagsFiltered,
        setActiveFilter,
        activeFilter,
    } = props.labels;

    const handleClick = (filter: IFilterPack) => {
        if (activeFilter === filter.filter_id) {
            setActiveFilter(null);
            setTagsFiltered([]);
        } else {
            setActiveFilter(filter.filter_id);
            setTagsFiltered(filter.tag);
        }
    };

    return (
        <div className="flex flex-col w-full gap-y-2 p-1">
            <h2 className="text-main font-semibold text-sm">Filtros de clientes</h2>
            <div className="flex flex-wrap gap-1.5">
                {clientsFilterList.map((filter) => {
                    const isActive = activeFilter === filter.filter_id;
                    return (
                        <div
                            key={filter.filter_id}
                            onClick={() => handleClick(filter)}
                            className={`p-1 px-2.5 rounded-dx cursor-pointer border text-xs font-medium transition-all shadow-xs ${
                                isActive
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
    );
};

export default ClientsFilters;