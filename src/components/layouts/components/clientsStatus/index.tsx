import React, { useEffect, useState } from "react";
import { LoadingIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import type { TKPISKeys } from "./statusBanner";
import type { IClientStatus } from "../../../../utils/types/sellerObserver/history.types";
import { getHistoryDraftClientsStatusPreview } from "../../../../services/plannerServices/history.service";
import type { ITag } from "../../../../utils/types/tags.types";
import { useMapPlannerContext, useModeRef } from "../../../../utils/hooks/map/useContextRef";
import { getHistoryClientsStatus } from "../../../../services/history.service";

import { changeAllVisibility, changeWatchedList } from "../../../../store/slices/planner/draftsSlice";

type TVariants = 'danger' | 'warning' | 'ok'


interface IClientsKpiProps {
    item: IKpiItem;
    values: IClientStatus[];
    isLoading: boolean;
    mapContext?: any;
    isAnyKpiActive: boolean;
    isStatic?: boolean;
}

interface IKpiItem {
    key: TKPISKeys;
    title: string;
    type: TVariants;
}

interface IClientStatusProps {
    activeFilter: number | null;
    tagsFiltered: ITag[];
    isStatic?: boolean;
}

interface IStatusProps {
    kpi: IKpiItem[];
    activeFilter: number | null;
    channelTags: string[];
    supraChannelTags: string[];
    distributionChannelTags: string[];
    tagsFiltered: ITag[];
    enterprise_id: number;
    isStatic?: boolean;
}


const areArraysEqual = (a: any[], b: any[]) =>
    a.length === b.length && new Set([...a, ...b]).size === a.length;

const ClientsKpi = (props: IClientsKpiProps) => {
    const dispatch = useAppDispatch();
    const { watchList } = useAppSelector((state) => state.drafts.history);
    const { item, values, isLoading, isAnyKpiActive, isStatic } = props;

    const isActive = values.length > 0 && areArraysEqual(watchList, values.map(v => v.client_id));
    const hasValues = values.length > 0;

    const showAsActive = isStatic || (hasValues && (!isAnyKpiActive || isActive));

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isStatic) return;
        if (!isActive && hasValues) {
            dispatch(changeWatchedList({
                wl: values.map(v => v.client_id),
                group: "history"
            }));
        } else {
            dispatch(changeAllVisibility({
                opp: true,
                group: "history"
            }));
        }
    };

    const getTypeStyles = () => {
        if (!hasValues && !isStatic) {
            return "bg-primary-500/30 border-main/10 text-main/30";
        }
        switch (item.type) {
            case 'danger':
                return "bg-error/60 border-error/90 text-variant hover:border-error/90";
            case 'warning':
                return "bg-warning/60 border-warning/90 text-variant hover:border-warning/90";
            case 'ok':
            default:
                return "bg-info/60 border-info/90 text-variant hover:border-info/90";
        }
    };

    return (
        <div
            onClick={handleMouseDown}
            className={`
                w-full flex flex-col justify-center items-center gap-y-1.5 rounded-dx p-3 border
                backdrop-blur-xl shadow-xs transition-all cursor-pointer
                ${showAsActive ? 'opacity-100' : 'opacity-50 grayscale-40'}
                ${getTypeStyles()}
                ${isActive ? 'ring-2 ring-focus-300/50 scale-[1.02]' : ''}
            `}
        >
            {isLoading ? (
                <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-6 fill-current" />
            ) : (
                <p className="text-xl font-bold font-mono select-none leading-none">{values.length}</p>
            )}
            <h2 className="text-xs font-semibold select-none text-center leading-tight">{item.title}</h2>
        </div>
    );
};

const calculateStats = (clientsStatus?: IClientStatus[]) => {
    const data = clientsStatus ?? [];
    const initialStats: Record<TKPISKeys, IClientStatus[]> = { zero: [], one: [], two: [], lot: [] };

    return data.reduce((acc, client) => {
        const count = client?.portfoliolist?.length ?? 0;
        if (count === 0) acc.zero.push(client);
        else if (count === 1) acc.one.push(client);
        else if (count === 2) acc.two.push(client);
        else acc.lot.push(client);
        return acc;
    }, initialStats);
};

const ClientsStatus = (props: IClientStatusProps) => {
    const { tagsFiltered } = props;
    const { enterprise_id } = useAppSelector((state) => state.user.enterprise);
    const { mode } = useModeRef();

    const supraChannelTags = tagsFiltered.find((tg) => tg.key === 'supra_channel')?.labels ?? [];
    const channelTags = tagsFiltered.find((tg) => tg.key === 'channel')?.labels ?? [];
    const distributionChannelTags = tagsFiltered.find((tg) => tg.key === 'distribution_channel')?.labels ?? [];

    const kpi: IKpiItem[] = [
        {
            key: 'zero',
            title: 'Sin cartera',
            type: 'danger',
        },
        {
            key: 'one',
            title: 'En una cartera',
            type: 'ok',
        },
        {
            key: 'two',
            title: 'En dos carteras',
            type: 'ok',
        },
        {
            key: 'lot',
            title: 'En más de dos carteras',
            type: 'warning',
        }
    ];

    const dataProps = {
        kpi,
        channelTags,
        supraChannelTags,
        distributionChannelTags,
        enterprise_id,
        ...props
    };

    if (mode === 'planner') {
        return <ClientStatusPlanner {...dataProps} />;
    } else if (mode === 'sellerObserver' || mode === 'default') {
        return <ClientStatusObserver {...dataProps} isStatic={true} />;
    }
};

const ClientStatusPlanner = (props: IStatusProps) => {
    const {
        kpi,
        enterprise_id,
        isStatic
    } = props;

    const mapContext = useMapPlannerContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [clientsStatus, setClientsStatus] = useState<IClientStatus[]>([]);
    const { currentDraft, history } = useAppSelector((state) => state.drafts);

    useEffect(() => {
        if (history.loading) return;

        setIsLoading(true);
        getHistoryDraftClientsStatusPreview(enterprise_id, currentDraft).then((res) => {
            setClientsStatus(res.map((client) => ({
                client_id: client.id,
                portfoliolist: client.portfoliolist.map((portfolio) => portfolio.id)
            })));
            setIsLoading(false);
        });
    }, [
        enterprise_id,
        history.clients,
        history.loading
    ]);

    const stats = calculateStats(clientsStatus);
    const { watchList } = useAppSelector((state) => state.drafts.history);
    const isAnyKpiActive = Object.values(stats).some(val =>
        val.length > 0 && areArraysEqual(watchList, val.map(v => v.client_id))
    );

    return (
        <div className="px-2 py-1 cursor-pointer flex flex-col gap-y-3 min-w-54">
            <div className="flex flex-col gap-y-2">
                {kpi.map((item) => (
                    <ClientsKpi
                        mapContext={mapContext}
                        key={item.key}
                        isLoading={isLoading}
                        item={item}
                        values={stats[item.key]}
                        isAnyKpiActive={isAnyKpiActive}
                        isStatic={isStatic}
                    />
                ))}
            </div>
            <hr className="w-full border-main/10" />
        </div>
    );
};

const ClientStatusObserver = (props: IStatusProps) => {
    const {
        kpi,
        activeFilter,
        channelTags,
        supraChannelTags,
        distributionChannelTags,
        tagsFiltered,
        enterprise_id,
        isStatic
    } = props;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [clientsStatus, setClientsStatus] = useState<IClientStatus[]>([]);
    const { watchList } = useAppSelector((state) => state.drafts.history);

    const stats = calculateStats(clientsStatus);
    const isAnyKpiActive = Object.values(stats).some(val =>
        val.length > 0 && areArraysEqual(watchList, val.map(v => v.client_id))
    );

    useEffect(() => {
        setIsLoading(true);
        getHistoryClientsStatus(enterprise_id, {
            filter_id: activeFilter,
            channel: channelTags,
            supra_channel: supraChannelTags,
            distribution_channel: distributionChannelTags
        }).then((res) => {
            setClientsStatus(res);
            setIsLoading(false);
        });
    }, [enterprise_id, activeFilter, tagsFiltered]);

    return (
        <div className="px-1 py-1 cursor-pointer flex flex-col gap-y-3 min-w-54">
            <div className="flex flex-col gap-y-2">
                {kpi.map((item) => (
                    <ClientsKpi
                        key={item.key}
                        isLoading={isLoading}
                        item={item}
                        values={stats[item.key]}
                        isAnyKpiActive={isAnyKpiActive}
                        isStatic={isStatic}
                    />
                ))}
            </div>
            <hr className="w-full border-main/10" />
        </div>
    );
};

export default ClientsStatus;
