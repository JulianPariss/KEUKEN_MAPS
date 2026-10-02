import { LoadingIcon, ProfileIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { formatMoney } from "../../../../utils/helpers/formatters";
import { useEffect } from "react";
import { CustomTooltip } from "../../../../components/customTooltip";
import { getComposedStats } from "../../../../store/selectors/stats.selector";
import { fetchSellerStatsById } from "../../../../store/slices/sellerObserver/statsSlice";

interface IKPIProps {
    title: string;
    value?: string | number;
    colorClass?: string;
    isFocus?: boolean;
    isLoading?: boolean;
    tooltip?: string;
    subtitle?: string;
}

interface IProps {
    userId: number;
}

const SellerModal = (props: IProps) => {
    const dispatch = useAppDispatch();

    const { sellerById } = useAppSelector((state) => state.sellers);
    const seller = sellerById[props.userId];

    const { loading } = useAppSelector((state) => state.stats);
    const {
        saleEffectivenessTotal,
        saleEffectivenessInRoute,
        visitEffectiveness,
        clientsInRouteCountOrders,
        clientsVisited,
        totalClients,
        totalClientsWithOrders,
        clients_in_route,
        clientsOutRouteCountOrders,
        orders_in_route,
        orders_out_route,
        visits_gps_in_route,
        visits_gps_out_route,
        total,
        clients_out_route,
    } = useAppSelector(getComposedStats(props.userId));

    useEffect(() => {
        dispatch(fetchSellerStatsById({
            sellerId: props.userId,
        }));
    }, [props.userId]);

    const isOnline = seller.state === 'OPEN';

    const KpiCard = (props: IKPIProps) => {
        const { title, value, colorClass, isFocus, isLoading, tooltip, subtitle } = props;
        const textClass = isFocus ? 'text-variant' : 'text-main';
        const labelClass = isFocus ? 'text-variant/80' : 'text-main/50';
        const subtitleClass = isFocus ? 'text-variant/70' : 'text-main/60';
        const loadingFillClass = isFocus ? 'fill-variant' : 'fill-main';

        return (
            <div className={`flex flex-col items-center justify-center p-3.5 rounded-dx border border-main/10 shadow-xs transition-all ${colorClass}`}>
                {tooltip && (
                    <div className="relative w-full">
                        <div className="absolute top-[-10px] right-[-8px]">
                            <CustomTooltip message={tooltip} />
                        </div>
                    </div>
                )}
                {!isLoading ? (
                    <p className={`text-2xl md:text-3xl font-bold ${textClass} h-8 md:h-9 flex items-center`}>{(value ?? '-')}</p>
                ) : (
                    <LoadingIcon className={`animate-[spin_1s_linear_reverse_infinite] size-8 md:size-9 ${loadingFillClass}`} />
                )}
                <div className="flex flex-col items-center text-center mt-1">
                    <p className={`text-[10px] uppercase font-bold tracking-wider leading-tight ${labelClass}`}>
                        {title}
                    </p>
                    {subtitle ? <p className={`text-[10px] font-medium mt-0.5 ${subtitleClass}`}>{subtitle}</p> : null}
                </div>
            </div>
        );
    };

    const isPerformingWell = saleEffectivenessTotal >= 30;

    return (
        <div className="max-w-[90vw] xl:min-w-[750px] xl:max-w-[90vw]">
            <div className="flex flex-col gap-y-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx gap-y-4 md:gap-y-0 shadow-xs">
                    <div className="flex items-center gap-x-3 md:gap-x-4">
                        <div className="relative">
                            <div className="p-1.5 rounded-full bg-linear-to-br from-primary-500 to-primary-900 border border-main/10">
                                <ProfileIcon className="fill-main size-9 md:size-12" />
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 size-3.5 md:size-4.5 rounded-full border-2 border-primary-950 ${isOnline ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                        </div>
                        <div>
                            <h2 className="text-main text-lg md:text-2xl font-bold tracking-tight">
                                {seller.sellerName}
                                <span className="text-focus-300 ml-2 text-sm md:text-lg font-mono font-semibold">#{seller.seller}</span>
                            </h2>
                            <div className="flex items-center gap-x-3 mt-0.5 md:mt-1">
                                <p className="text-[10px] md:text-xs text-main/40 italic">v{seller.app_version}</p>
                                <div className="size-1 rounded-full bg-main/20" />
                                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-success' : 'text-error'}`}>
                                    {seller.state === 'OPEN' && 'Ruta Abierta'}
                                    {seller.state === 'CLOSED' && 'Ruta Cerrada'}
                                    {seller.state === '-' && 'No abrió ruta'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`w-full md:w-auto px-5 py-2.5 rounded-dx border transition-colors duration-300 ${isPerformingWell ? 'bg-success/15 border-success/30' : 'bg-primary-500/10 border-main/10'}`}>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-x-4 md:gap-x-0">
                            <p className="text-[10px] text-main/40 uppercase font-bold tracking-wider">Venta del Día</p>
                            <p className="text-base md:text-xl font-bold text-focus-300 before:content-['$'] font-mono">{loading ? '...' : formatMoney(total ?? 0)}</p>
                            {!loading && (
                                <p className={`text-[11px] font-bold mt-0.5 ${isPerformingWell ? 'text-success' : 'text-main/50'}`}>
                                    EFECTIVIDAD: {saleEffectivenessTotal.toFixed(1)}%
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                        <h3 className="text-base md:text-lg font-bold text-main mb-3">Estadísticas Generales</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <KpiCard
                                title="EFEC. DE VENTA TOTAL"
                                tooltip="Clientes con pedidos entre Clientes totales"
                                value={loading ? undefined : `${saleEffectivenessTotal.toFixed(1)}%`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={loading}
                                subtitle={`( ${totalClientsWithOrders} / ${totalClients} )`}
                            />
                            <KpiCard
                                title="EFEC. DE VENTA EN RUTA"
                                tooltip="Clientes en ruta con pedidos entre Total de clientes en ruta"
                                value={loading ? undefined : `${saleEffectivenessInRoute.toFixed(1)}%`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={loading}
                                subtitle={`( ${clientsInRouteCountOrders} / ${clients_in_route} )`}
                            />
                            <KpiCard
                                title="EFEC. DE VISITA"
                                tooltip="Clientes visitados entre Total de clientes"
                                value={loading ? undefined : `${visitEffectiveness.toFixed(1)}%`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={loading}
                                subtitle={`( ${clientsVisited} / ${totalClients} )`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                            <h3 className="text-base md:text-lg font-bold text-main mb-3">En Ruta</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <KpiCard title="Clientes" value={clients_in_route} colorClass="bg-primary-500/20" isLoading={loading} />
                                <KpiCard title="Clientes con Pedidos" value={loading ? undefined : clientsInRouteCountOrders} colorClass="bg-primary-500/20" isLoading={loading} />
                                <KpiCard title="Pedidos" value={orders_in_route} colorClass="bg-focus-500" isFocus={true} isLoading={loading} />
                                <KpiCard title="Visitados" value={visits_gps_in_route} colorClass="bg-primary-900/60" isLoading={loading} />
                            </div>
                        </div>
                        <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                            <h3 className="text-base md:text-lg font-bold text-main mb-3">Fuera de Ruta</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <KpiCard title="Clientes" value={clients_out_route} colorClass="bg-primary-500/20" isLoading={loading} />
                                <KpiCard title="Clientes con Pedidos" value={clientsOutRouteCountOrders} colorClass="bg-primary-500/20" isLoading={loading} />
                                <KpiCard title="Pedidos" value={orders_out_route} colorClass="bg-focus-500" isFocus={true} isLoading={loading} />
                                <KpiCard title="Visitados" value={visits_gps_out_route} colorClass="bg-primary-900/60" isLoading={loading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerModal;
