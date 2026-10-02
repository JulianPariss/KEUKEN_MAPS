import { useEffect } from "react";
import { useModalRef } from "../../../../../../utils/hooks/map/useContextRef";
import ClientsTableModal from "./components/clientsTableModal";
import { useAppDispatch } from "../../../../../../store/hooks";
import { fetchHistoryClients } from "../../../../../../store/slices/sellerObserver/historySlice";
import { fetchPortfolios } from "../../../../../../store/slices/sellerObserver/portfolioSlice";
import { ContractCheckIcon } from '@repo/icons';

const Clients = () => {
    const { OpenModal, isOpen } = useModalRef();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchHistoryClients({ days: null }))
        dispatch(fetchPortfolios())
    }, [dispatch, isOpen]);

    return (
        <div
            onClick={() => {
                OpenModal({
                    Component: <ClientsTableModal
                    />,
                    isRequired: false,
                })
            }}
            className="flex flex-col justify-center
            bg-primary-main/90 
            bg-gradient-to-l from-primary-light/60 to-primary-main/90
            rounded-md shadow-md shadow-black/25 
            gap-y-5  backdrop-blur-lg mt-2 hover:scale-102 transition-all duration-300" >
            <div className="cursor-pointer flex items-center justify-between p-2 px-3">
                <p className="text-white select-none">Listado de clientes</p>
                <ContractCheckIcon className="size-6 fill-white" />
            </div>
        </div >
    )
}

export default Clients;
