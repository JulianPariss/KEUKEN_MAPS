import { useAppSelector } from "../../../../../store/hooks";
import BaseClientsList from "../../../components/BaseClientsList";
import type { IClientStatus } from "../../../../../utils/types/sellerObserver/history.types";


const ClientsList = () => {

    const { clients, loading: historyLoading } = useAppSelector((state) => state.history);
    const { sellerById } = useAppSelector((state) => state.sellers);

    const clientStatus = clients.reduce((acc, client) => {
        acc.push({
            client_id: client.id,
            portfoliolist: client.portfoliolist.map((portfolio) => portfolio.id)
        })
        return acc;
    }, [] as IClientStatus[])



    return (
        <BaseClientsList
            clients={clients}
            clientStatus={clientStatus}
            historyLoading={historyLoading}
            sellerById={sellerById}
        />
    );
};

export default ClientsList;
