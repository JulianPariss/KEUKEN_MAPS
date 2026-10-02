import { useAppSelector } from "../../../../../store/hooks";
import BaseClientsList from "../../../components/BaseClientsList";
import type { IClientStatus } from "../../../../../utils/types/sellerObserver/history.types";

const ClientsList = () => {
    const { clients, loading: historyLoading } = useAppSelector((state) => state.drafts.history);
    const { sellerById } = useAppSelector((state) => state.drafts.sellers);

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
            title={`Listado de Clientes`}
            description="Vista detallada de clientes y carteras para el borrador seleccionado."
        />
    );
};

export default ClientsList;
