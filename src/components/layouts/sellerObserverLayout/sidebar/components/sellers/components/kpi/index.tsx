import type { IComposedStats } from "../../../../../../../../utils/types/sellerObserver/stats.types"
import KpiItem from "../../../../../../components/kpiItem";

interface IProps {
    composedStats: IComposedStats;
    isLoadingStats: boolean;
}


const Kpi = (props: IProps) => {
    const { composedStats, isLoadingStats } = props;

    return (
        <div className="grid grid-cols-1 grid-rows-1 gap-2 rounded-dx">
            <div className="flex flex-col p-2.5 bg-primary-950/40 backdrop-blur-md rounded-dx gap-y-2 border border-main/10 shadow-xs">
                <p className="text-main/90 text-xs font-medium tracking-wide text-left">Clientes con Pedidos</p>
                <div className="grid grid-cols-2 text-main gap-1.5">
                    {/* En Ruta */}
                    <KpiItem
                        isLoading={isLoadingStats}
                        currentValue={composedStats.clientsInRouteCountOrders}
                        totalValue={composedStats.clients_in_route}
                        primary={true}
                        subtitle="En Ruta"
                    />
                    {/* Fuera de Ruta */}
                    <KpiItem
                        isLoading={isLoadingStats}
                        currentValue={composedStats.clientsOutRouteCountOrders}
                        totalValue={composedStats.clients_out_route}
                        subtitle="Fuera de Ruta"
                    />
                </div>
            </div>
            <div className="flex flex-col p-2.5 bg-primary-950/40 backdrop-blur-md rounded-dx gap-y-2 border border-main/10 shadow-xs">
                <p className="text-main/90 text-xs font-medium tracking-wide text-left">Clientes visitados</p>
                <div className="grid grid-cols-2 text-main gap-1.5">
                    {/* En Ruta */}
                    <KpiItem
                        isLoading={isLoadingStats}
                        currentValue={composedStats.visits_gps_in_route}
                        totalValue={composedStats.clients_in_route}
                        primary={true}
                        subtitle="En Ruta"
                    />
                    {/* Fuera de Ruta */}
                    <KpiItem
                        isLoading={isLoadingStats}
                        currentValue={composedStats.visits_gps_out_route}
                        totalValue={composedStats.clients_out_route}
                        subtitle="Fuera de Ruta"
                    />
                </div>
            </div>
        </div>
    );
};

export default Kpi;