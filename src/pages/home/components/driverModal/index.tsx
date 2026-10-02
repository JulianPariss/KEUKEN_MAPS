import { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { LoadingIcon, ProfileIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
    fetchCollectedPaymentsByDelivery,
} from '../../../../store/slices/driverObserver/collectedPaymentsSlice';
import {
    fetchRejectedsByDelivery,
} from '../../../../store/slices/driverObserver/rejectedsSlice';
import { getCollectedPaymentsSummaryByDeliveryIds } from '../../../../store/selectors/collectedPayments.selector';
import { getRejectedsSummaryByDeliveryIds } from '../../../../store/selectors/rejecteds.selector';
import { formatMoney, formatWeight } from '../../../../utils/helpers/formatters';
import { CustomTooltip } from '../../../../components/customTooltip';
import { indexToColor } from '@repo/map-core';

interface IKPIProps {
    title: string;
    value?: string | number;
    colorClass?: string;
    isFocus?: boolean;
    isLoading?: boolean;
    tooltip?: string;
    subtitle?: string;
}

interface IDriverModalProps {
    driverId?: number;
    userId?: number;
}

const KpiCard = (props: IKPIProps) => {
    const { title, value, colorClass = '', isFocus, isLoading, tooltip, subtitle } = props;
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
                <p className={`text-2xl md:text-3xl font-bold ${textClass} h-8 md:h-9 flex items-center`}>
                    {value ?? '-'}
                </p>
            ) : (
                <LoadingIcon className={`animate-[spin_1s_linear_reverse_infinite] size-8 md:size-9 ${loadingFillClass}`} />
            )}
            <div className="flex flex-col items-center text-center mt-1 h-full">
                <p className={`text-[10px] uppercase font-bold tracking-wider leading-tight ${labelClass}`}>
                    {title}
                </p>
                {subtitle ? <p className={`text-[10px] font-medium mt-0.5 ${subtitleClass}`}>{subtitle}</p> : null}
            </div>
        </div>
    );
};

const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
        case 'VISITED':
            return { label: 'Completado', dotColor: 'bg-status-success' };
        case 'PENDING':
            return { label: 'Pendiente', dotColor: 'bg-main/50' };
        default:
            return { label: 'Pendiente', dotColor: 'bg-main/50' };
    }
};

const DriverModal = (props: IDriverModalProps) => {
    const dispatch = useAppDispatch();
    const driverId = Number(props.driverId ?? props.userId ?? 0);

    const { driverById, driverRoutes, driversUI } = useAppSelector((state) => state.drivers);
    const driver = driverById[driverId];

    const { deliveriesByDriverId, loading: isLoadingDeliveries } = useAppSelector((state) => state.deliveries);
    const driverDeliveries = deliveriesByDriverId[driverId] ?? [];

    const [disabledDeliveryIds, setDisabledDeliveryIds] = useState<Set<number>>(new Set());

    const activeDeliveries = useMemo(() => {
        return driverDeliveries.filter((d) => d.id != null && !disabledDeliveryIds.has(d.id));
    }, [driverDeliveries, disabledDeliveryIds]);

    const activeDeliveryIds = useMemo(() => activeDeliveries.map((d) => d.id as number), [activeDeliveries]);

    const collectedPaymentsSummary = useAppSelector((state) => getCollectedPaymentsSummaryByDeliveryIds(state, activeDeliveryIds), shallowEqual);
    const rejectedsSummary = useAppSelector((state) => getRejectedsSummaryByDeliveryIds(state, activeDeliveryIds), shallowEqual);

    useEffect(() => {
        const deliveries = deliveriesByDriverId[driverId];
        if (!deliveries || deliveries.length === 0) return;

        for (const delivery of deliveries) {
            if (delivery.id) {
                dispatch(fetchCollectedPaymentsByDelivery({ deliveryId: delivery.id }));
                dispatch(fetchRejectedsByDelivery({ deliveryId: delivery.id }));
            }
        }
    }, [dispatch, driverId, deliveriesByDriverId]);

    const { clientIdsByDeliveryId, clientById } = useAppSelector((state) => state.deliveryClients);

    const routes = driverRoutes?.routes?.[driverId];
    const hasRoute = Boolean(routes && Object.keys(routes).length > 0);

    const driverInProgress = hasRoute && driverDeliveries.some((d) => d.status === 'PENDING');

    const summaryStats = useMemo(() => {
        let balanceTotal = 0;
        let bulksTotal = 0;
        let clientsTotal = 0;
        let cashTotal = 0;
        let checkingAccountTotal = 0;
        let weightTotal = 0;

        for (const d of activeDeliveries) {
            balanceTotal += Number(d.balance || 0);
            bulksTotal += Number(d.bulks || 0);
            clientsTotal += Number(d.clientsCount || 0);
            cashTotal += Number(d.totalInCash || 0);
            checkingAccountTotal += Number(d.totalInCheckingAccount || 0);
            weightTotal += Number(d.weight || 0);
        }

        const totalToDeliver = cashTotal + checkingAccountTotal;

        return {
            balanceTotal,
            bulksTotal,
            clientsTotal,
            cashTotal,
            checkingAccountTotal,
            weightTotal,
            totalToDeliver,
            deliveriesCount: activeDeliveries.length,
            paymentCollectedAmount: collectedPaymentsSummary.paymentCollectedAmount,
            amountToCurrentAccount: collectedPaymentsSummary.amountToCurrentAccount,
            rejectedAmount: rejectedsSummary.rejectedAmount,
            cashAmount: collectedPaymentsSummary.cashAmount,
            accountAmount: collectedPaymentsSummary.accountAmount,
            extraAmount: collectedPaymentsSummary.extraAmount,
        };
    }, [activeDeliveries, collectedPaymentsSummary, rejectedsSummary]);

    const clientStats = useMemo(() => {
        let totalClients = 0;
        let processedClients = 0;
        let totalBulks = 0;
        let totalInvoices = 0;

        for (const delivery of activeDeliveries) {
            totalBulks += Number(delivery.bulks || 0);
            totalInvoices += Number(delivery.invoicesCount || 0);
            const cIds = clientIdsByDeliveryId[delivery.id] || [];
            if (cIds.length > 0) {
                for (const cId of cIds) {
                    totalClients++;
                    const client = clientById[cId];
                    if (client?.isProcessed) {
                        processedClients++;
                    }
                }
            } else {
                totalClients += Number(delivery.clientsCount || 0);
            }
        }

        const progressPercent = totalClients > 0 ? Math.round((processedClients / totalClients) * 100) : 0;

        return {
            totalClients,
            processedClients,
            progressPercent,
            totalBulks,
            totalInvoices,
        };
    }, [activeDeliveries, clientIdsByDeliveryId, clientById]);

    const sortedDeliveries = useMemo(() => {
        return [...driverDeliveries].sort((a, b) => a.id - b.id);
    }, [driverDeliveries]);

    const driverColor = driversUI[driverId]?.color ?? driver?.color ?? indexToColor(driverId);
    const isPerformingWell = clientStats.progressPercent >= 50;

    return (
        <div className="w-[65vw] max-h-[85vh] overflow-y-auto pr-1">
            <div className="flex flex-col gap-y-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx gap-y-4 md:gap-y-0 shadow-xs">
                    <div className="flex items-center gap-x-3 md:gap-x-4">
                        <div className="relative">
                            <div
                                className="p-1.5 rounded-full bg-linear-to-br from-primary-500 to-primary-900 border border-main/10"
                                style={{ borderColor: `${driverColor}60` }}
                            >
                                <ProfileIcon className="fill-main size-9 md:size-12" />
                            </div>
                            <div
                                className={`absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 size-3.5 md:size-4.5 rounded-full border-2 border-primary-950 ${driverInProgress
                                    ? 'bg-status-success shadow-[0_0_10px_rgba(11,119,49,0.5)]'
                                    : 'bg-status-info'
                                    }`}
                            />
                        </div>
                        <div>
                            <h2 className="text-main text-lg md:text-2xl font-bold tracking-tight">
                                {driver?.name ?? `Conductor #${driverId}`}
                                <span className="text-focus-300 ml-2 text-sm md:text-lg font-mono font-semibold">
                                    #{driverId}
                                </span>
                            </h2>
                            <div className="flex items-center gap-x-3 mt-0.5 md:mt-1">
                                {driver?.phoneNumber && (
                                    <p className="text-[10px] md:text-xs text-main/60 font-mono">
                                        {driver.phoneNumber}
                                    </p>
                                )}
                                {driver?.phoneNumber && <div className="size-1 rounded-full bg-main/20" />}
                                <p
                                    className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${driverInProgress ? 'text-status-success' : 'text-main/50'
                                        }`}
                                >
                                    {driverInProgress ? 'En Curso' : 'Finalizado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Totalizador de entrega del día */}
                    <div
                        className={`w-full md:w-auto px-5 py-2.5 rounded-dx border transition-colors duration-300 ${isPerformingWell
                            ? 'bg-status-success/15 border-status-success/30'
                            : 'bg-primary-500/10 border-main/10'
                            }`}
                    >
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-x-4 md:gap-x-0">
                            <p className="text-[10px] text-main/40 uppercase font-bold tracking-wider">
                                Total a Entregar
                            </p>
                            <p className="text-base md:text-xl font-bold text-focus-300 before:content-['$'] font-mono">
                                {isLoadingDeliveries ? '...' : formatMoney(summaryStats.totalToDeliver)}
                            </p>
                        </div>
                    </div>
                </div>

                {sortedDeliveries.length === 0 ? (
                    <div className="p-6 text-center text-main/40 text-xs font-medium">
                        No hay repartos asignados a este conductor para la fecha seleccionada.
                    </div>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {sortedDeliveries.map((delivery) => {
                            const badge = getDeliveryStatusBadge(delivery.status);
                            const isSelected = delivery.id != null && !disabledDeliveryIds.has(delivery.id);
                            const isOnlySelected = isSelected && activeDeliveries.length <= 1;

                            return (
                                <div
                                    key={delivery.id}
                                    title={isOnlySelected ? 'Debe haber al menos un reparto seleccionado' : undefined}
                                    onClick={() => {
                                        if (delivery.id == null || isOnlySelected) return;

                                        setDisabledDeliveryIds((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(delivery.id)) {
                                                next.delete(delivery.id);
                                            } else {
                                                const currentActiveCount = driverDeliveries.filter(
                                                    (d) => d.id != null && !prev.has(d.id)
                                                ).length;
                                                if (currentActiveCount <= 1) return prev;
                                                next.add(delivery.id);
                                            }
                                            return next;
                                        });
                                    }}
                                    className={`px-3 py-2 border rounded-dx flex items-center justify-between gap-2 shadow-xs transition-all select-none ${isOnlySelected ? 'cursor-default' : 'cursor-pointer'
                                        } ${isSelected
                                            ? 'bg-primary-900/50 border-main/10 hover:border-focus-300/40'
                                            : 'bg-primary-950/20 border-main/5 opacity-50 hover:opacity-80'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`size-1.5 rounded-full ${badge.dotColor}`} />
                                            <span className="text-xs font-bold text-main">
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-focus-300 font-mono font-bold text-xs md:text-sm before:content-['#']">
                                            {delivery.id}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                    <h3 className="text-base md:text-lg font-bold text-main mb-3">Objetivos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <KpiCard
                            title="CLIENTES COMPLETADOS"
                            tooltip="Clientes sin facturas o rechazos pendientes"
                            value={isLoadingDeliveries ? undefined : `${clientStats.progressPercent}%`}
                            colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                            isLoading={isLoadingDeliveries}
                            subtitle={`( ${clientStats.processedClients} / ${clientStats.totalClients} )`}
                        />
                        <KpiCard
                            title="TOTAL DESPACHADO POR CONTADO"
                            tooltip="Total despachado de contado"
                            value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.cashTotal)}`}
                            colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                            isLoading={isLoadingDeliveries}
                        />
                        <KpiCard
                            title="TOTAL DESPACHADO POR CTA. CTE."
                            tooltip="Total despachado de cuenta corriente"
                            value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.checkingAccountTotal)}`}
                            colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                            isLoading={isLoadingDeliveries}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {/* Estadísticas Generales */}
                    <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                        <h3 className="text-base md:text-lg font-bold text-main mb-3">Estadísticas de cobros</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <KpiCard
                                title="TOTAL COBRADO"
                                tooltip="Total cobrado"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.paymentCollectedAmount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                            <KpiCard
                                title="TOTAL COBRADO EN CONTADO"
                                tooltip="Total cobrado en contado"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.cashAmount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                            <KpiCard
                                title="TOTAL COBRADO EN CUENTA CORRIENTE"
                                tooltip="Total cobrado en cuenta corriente"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.accountAmount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                            <KpiCard
                                title="MOVIMIENTOS A CTA. CORRIENTE"
                                tooltip="Total de movimientos a cuenta corriente"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.amountToCurrentAccount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                            <KpiCard
                                title="TOTAL DEVUELTO"
                                tooltip="Total devuelto"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(rejectedsSummary.rejectedAmount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                            <KpiCard
                                title="TOTAL COBRADO EXTRA"
                                tooltip="Total cobrado de repartos previos"
                                value={isLoadingDeliveries ? undefined : `$${formatMoney(summaryStats.extraAmount)}`}
                                colorClass="bg-primary-500/20 hover:bg-primary-500/30"
                                isLoading={isLoadingDeliveries}
                            />
                        </div>
                    </div>

                    {/* Desglose Operativo y Financiero */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                            <h3 className="text-base md:text-lg font-bold text-main mb-3">Carga y Capacidad</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <KpiCard
                                    title="Repartos"
                                    value={summaryStats.deliveriesCount}
                                    colorClass="bg-primary-500/20"
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Bultos Totales"
                                    value={summaryStats.bulksTotal}
                                    colorClass="bg-primary-500/20"
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Peso Total"
                                    value={`${formatWeight(summaryStats.weightTotal)} kg`}
                                    colorClass="bg-focus-500"
                                    isFocus={true}
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Comprobantes"
                                    value={clientStats.totalInvoices}
                                    colorClass="bg-primary-900/60"
                                    isLoading={isLoadingDeliveries}
                                />
                            </div>
                        </div>

                        <div className="bg-primary-950/40 backdrop-blur-xl p-4 rounded-dx border border-main/10 shadow-xs">
                            <h3 className="text-base md:text-lg font-bold text-main mb-3">Estado de Entregas</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <KpiCard
                                    title="Clientes Totales"
                                    value={clientStats.totalClients}
                                    colorClass="bg-primary-500/20"
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Procesados"
                                    value={clientStats.processedClients}
                                    colorClass="bg-primary-500/20"
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Pendientes"
                                    value={Math.max(0, clientStats.totalClients - clientStats.processedClients)}
                                    colorClass="bg-focus-500"
                                    isFocus={true}
                                    isLoading={isLoadingDeliveries}
                                />
                                <KpiCard
                                    title="Saldo Restante"
                                    value={`$${formatMoney(summaryStats.balanceTotal)}`}
                                    colorClass="bg-primary-900/60"
                                    isLoading={isLoadingDeliveries}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverModal;
