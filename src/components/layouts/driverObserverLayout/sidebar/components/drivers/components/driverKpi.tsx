import { formatWeight } from "../../../../../../../utils/helpers/formatters";
import KpiItem from "../../../../../components/kpiItem";

export interface IDriverSummaryStats {
    balanceTotal: number;
    bulksTotal: number;
    clientsTotal: number;
    cashTotal: number;
    checkingAccountTotal: number;
    weightTotal: number;
    deliveriesCount: number;
}

interface IDriverKpiProps {
    summaryStats: IDriverSummaryStats;
    isLoading?: boolean;
}

const DriverKpi = ({ summaryStats, isLoading = false }: IDriverKpiProps) => {
    return (
        <div className="grid grid-cols-1 gap-2 rounded-dx">
            <div className="flex flex-col p-2.5 bg-primary-950/40 backdrop-blur-md rounded-dx gap-y-2 border border-main/10 shadow-xs">
                <p className="text-main/90 text-xs font-medium tracking-wide text-left">Resumen de Entregas</p>
                <div className="grid grid-cols-2 text-main gap-1.5">
                    {/* Repartos */}
                    <KpiItem
                        isLoading={isLoading}
                        currentValue={summaryStats.deliveriesCount}
                        primary={true}
                        subtitle="Repartos"
                    />
                    {/* Clientes totales */}
                    <KpiItem
                        isLoading={isLoading}
                        currentValue={summaryStats.clientsTotal}
                        subtitle="Clientes totales"
                    />
                    {/* Bultos totales */}
                    <KpiItem
                        isLoading={isLoading}
                        currentValue={summaryStats.bulksTotal}
                        subtitle="Bultos totales"
                    />
                    {/* Peso total */}
                    <KpiItem
                        isLoading={isLoading}
                        currentValue={formatWeight(summaryStats.weightTotal)}
                        unit="kg"
                        subtitle="Peso total"
                    />
                </div>
            </div>
        </div>
    );
};

export default DriverKpi;
