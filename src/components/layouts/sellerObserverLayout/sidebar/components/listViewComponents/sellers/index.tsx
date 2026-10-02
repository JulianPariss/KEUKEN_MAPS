import { ContractCheckIcon } from '@repo/icons';
import { useListViewContentRef } from "../../../../../../../utils/hooks/map/useContextRef";
import SellersList from "../../../../../../../pages/home/sellerObserver/listView/components/sellersList";
import ClientsList from "../../../../../../../pages/home/sellerObserver/listView/components/clientsList";

const SellersViewList = () => {
    const { setViewContent, viewKey } = useListViewContentRef();

    const handleClick = () => {
        if (viewKey === 'sellers') {
            setViewContent(<ClientsList/>, 'clients');
        } else {
            setViewContent(<SellersList />, 'sellers');
        }
    };

    const isActive = viewKey === 'sellers';

    return (
        <div
            onClick={handleClick}
            className={`flex flex-col justify-center bg-linear-to-r from-primary-500/80 to-primary-900/80
            backdrop-blur-xl rounded-dx shadow-xs border transition-all duration-200 cursor-pointer mt-2 group
            ${isActive ? 'border-focus-300 shadow-md shadow-focus-300/10' : 'border-main/10 hover:border-focus-300/50'}
            `}
        >
            <div className="flex items-center justify-between p-2.5 px-3">
                <p className={`select-none text-sm font-semibold transition-colors ${isActive ? 'text-focus-300' : 'text-main/90 group-hover:text-main'}`}>
                    Listado de Vendedores
                </p>
                <ContractCheckIcon className={`size-5 transition-colors ${isActive ? 'fill-focus-300' : 'fill-main/80 group-hover:fill-main'}`} />
            </div>
        </div>
    );
};

export default SellersViewList;
