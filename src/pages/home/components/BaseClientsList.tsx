import { GenericDataGrid, type IGenericDataGridColumn } from '@repo/devextreme';
import { memo, useMemo } from "react";

import { useAppSelector } from "../../../store/hooks";
import type { IClientStatus, IHistoryClient, IHistoryPortfolio } from "../../../utils/types/sellerObserver/history.types";
import { LoadingIcon } from '@repo/icons';

type TKPISKeys = 'zero' | 'one' | 'two' | 'lot';
type TVariants = 'danger' | 'warning' | 'ok';

interface IKpiItem {
    key: TKPISKeys;
    title: string;
    type: TVariants;
}

const KPI_CONFIG: IKpiItem[] = [
    { key: 'zero', title: 'Sin cartera', type: 'danger' },
    { key: 'one', title: 'En una cartera', type: 'ok' },
    { key: 'two', title: 'En dos carteras', type: 'ok' },
    { key: 'lot', title: 'En +2 carteras', type: 'warning' }
];

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

const ClientsKpiItem = memo(({ item, values, isLoading }: {
    item: IKpiItem,
    values: IClientStatus[],
    isLoading: boolean,
}) => {
    const hasValues = values.length > 0;

    return (
        <div
            className={`
                flex-1 flex items-center justify-between p-3 rounded-dx border transition-all select-none shadow-xs backdrop-blur-md
                ${item.type === 'danger' ? 'bg-error/20 border-error/40 text-error' :
                    item.type === 'warning' ? 'bg-warning/20 border-warning/40 text-warning' :
                        'bg-success/20 border-success/40 text-success'}
                ${!hasValues && 'opacity-40 grayscale pointer-events-none border-main/10 bg-primary-500/10 text-main/40'}
            `}
        >
            {isLoading ? (
                <LoadingIcon className="animate-spin size-5 fill-main mb-1" />
            ) : (
                <span className="text-xl text-main font-bold">{values.length}</span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-medium text-main/80 text-center">{item.title}</span>
        </div>
    );
});

// Interfaz genérica para soportar vendedores de Planner y SellerObserver
interface IGenericSeller {
    sellerName?: string; // SellerObserver
    name?: string;       // Planner
    seller?: number;     // SellerObserver
    id?: number;         // Planner
}

interface IFlattenedClient extends IHistoryClient {
    _supraCanal?: string;
    _canal?: string;
    _canalDistr?: string;
    _portfolio: IHistoryPortfolio | null;
    _portfolioName: string;
    _sellerName: string;
    _days: string;
    _rowKey: string;
}

interface BaseClientsListProps {
    clients: IHistoryClient[];
    clientStatus: IClientStatus[];
    historyLoading: boolean;
    sellerById: Record<number, IGenericSeller>;
    title?: string;
    description?: string;
}

const BaseClientsList = ({
    clients,
    clientStatus,
    historyLoading,
    sellerById,
    title = "Estado de Clientes",
    description = "Explora y filtra el listado completo de clientes para la distribución actual."
}: BaseClientsListProps) => {
    const { portfoliosById, porfolios } = useAppSelector((state) => state.portfolio);

    const supraCanalOptions = useMemo(() => {
        const values = new Set(clients.map(c => c.tags?.[0]?.labels?.[0]).filter(Boolean));
        return Array.from(values).sort();
    }, [clients]);

    const canalOptions = useMemo(() => {
        const values = new Set(clients.map(c => c.tags?.[1]?.labels?.[0]).filter(Boolean));
        return Array.from(values).sort();
    }, [clients]);

    const canalDistrOptions = useMemo(() => {
        const values = new Set(clients.map(c => c.tags?.[2]?.labels?.[0]).filter(Boolean));
        return Array.from(values).sort();
    }, [clients]);

    const daysOptions = useMemo(() => [
        'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do', 'Sin días programados', 'Fuera de ruta'
    ], []);

    const flattenedClients = useMemo(() => {
        const getDaysString = (p: any) => {
            if (!p) return daysOptions[8];
            const days = [];
            if (p.monday) days.push(daysOptions[0]);
            if (p.tuesday) days.push(daysOptions[1]);
            if (p.wednesday) days.push(daysOptions[2]);
            if (p.thursday) days.push(daysOptions[3]);
            if (p.friday) days.push(daysOptions[4]);
            if (p.saturday) days.push(daysOptions[5]);
            if (p.sunday) days.push(daysOptions[6]);
            return days.length > 0 ? days.join(' ') : daysOptions[7];
        };

        return clients.flatMap((client: IHistoryClient): IFlattenedClient[] => {
            const getPortfolioName = (portfolioId?: number) => {
                if (!portfolioId) return 'Sin Cartera';
                const index = portfoliosById[portfolioId];
                return (index !== undefined && porfolios[index]) ? porfolios[index].name : 'N/A';
            };

            const rowBase = {
                ...client,
                _supraCanal: client.tags?.[0]?.labels?.[0],
                _canal: client.tags?.[1]?.labels?.[0],
                _canalDistr: client.tags?.[2]?.labels?.[0],
            };

            const getSellerName = (mobileUser: number | null) => {
                const sellerId = mobileUser;

                if (!sellerId) return 'Sin Vendedor';
                const seller = sellerById[Number(sellerId)];
                if (!seller) return `Vendedor #${sellerId}`;

                const name = seller.sellerName || seller.name || `Vendedor #${sellerId}`;
                return `${name} (#${sellerId})`;
            };

            if (!client.portfoliolist || client.portfoliolist.length === 0) {
                return [{
                    ...rowBase,
                    _portfolio: null,
                    _portfolioName: getPortfolioName(),
                    _sellerName: getSellerName(null),
                    _days: getDaysString(null),
                    _rowKey: `${client.id}-none`
                }];
            }
            return client.portfoliolist.map((portfolio, index) => ({
                ...rowBase,
                _portfolio: portfolio,
                _portfolioName: getPortfolioName(portfolio.id),
                _sellerName: getSellerName(portfolio.mobile_user),
                _days: getDaysString(portfolio),
                _rowKey: `${client.id}-${portfolio.id ?? index}`
            }));
        });
    }, [clients, portfoliosById, porfolios, daysOptions, sellerById]);

    const activeDaysOptions = useMemo(() => {
        const values = new Set(flattenedClients.map(c => c._days).filter(Boolean));
        return Array.from(values).sort();
    }, [flattenedClients]);

    const activeDaysLookup = useMemo(() => activeDaysOptions.map(d => ({ id: d, name: d })), [activeDaysOptions]);

    const portfolioOptions = useMemo(() => {
        const values = new Set(flattenedClients.map(c => c._portfolioName).filter(Boolean));
        return Array.from(values).sort();
    }, [flattenedClients]);

    const stats = useMemo(() => calculateStats(clientStatus), [clientStatus]);

    const calculateUniqueClients = (options: any) => {
        if (options.name === 'uniqueClients') {
            if (options.summaryProcess === 'start') {
                options.totalValue = new Set();
            }
            if (options.summaryProcess === 'calculate') {
                const client = options.value;
                if (client?.id) {
                    options.totalValue.add(client.id);
                }
            }
            if (options.summaryProcess === 'finalize') {
                options.totalValue = options.totalValue.size;
            }
        }
    };

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: "id",
            caption: "ID",
            width: 75,
            alignment: "center",
            allowFiltering: true,
            allowGrouping: true,
            allowSorting: false,
            allowHeaderFiltering: false,
            allowHiding: false,
        },
        {
            dataField: "name",
            caption: "Nombre",
            width: 230,
            sortOrder: "asc",
            allowHiding: false,
            allowHeaderFiltering: false,
            allowSearch: true,
        },
        {
            dataField: "_sellerName",
            caption: "Vendedor",
            width: 200,
            allowGrouping: false,
            allowHeaderFiltering: true,
            allowSearch: true,
        },
        {
            dataField: "_portfolioName",
            caption: "Cartera",
            width: 140,
            allowGrouping: true,
            allowHeaderFiltering: true,
            lookup: {
                dataSource: portfolioOptions,
            },
        },
        {
            dataField: "_days",
            caption: "Días",
            width: 160,
            alignment: "left",
            allowGrouping: true,
            allowSorting: false,
            selectedFilterOperation: "=",
            cellRender: (data: any) => {
                const p = data.data._portfolio;
                const days = [
                    { k: 'monday', l: 'Lu' },
                    { k: 'tuesday', l: 'Ma' },
                    { k: 'wednesday', l: 'Mi' },
                    { k: 'thursday', l: 'Ju' },
                    { k: 'friday', l: 'Vi' },
                    { k: 'saturday', l: 'Sa' },
                    { k: 'sunday', l: 'Do' },
                ];
                return (
                    <div className="flex gap-1 justify-center">
                        {days.map(d => {
                            const isActive = p && p[d.k as keyof IHistoryPortfolio];
                            return (
                                <div
                                    key={d.k}
                                    className={`
                                        size-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                        ${isActive
                                            ? 'bg-focus-300 text-variant border border-focus-300/40 shadow-xs'
                                            : 'bg-primary-500/10 text-main/30 border border-main/5'}
                                    `}
                                >
                                    {d.l}
                                </div>
                            );
                        })}
                    </div>
                );
            },
            headerFilter: {
                dataSource: daysOptions.map(day => ({
                    text: day,
                    value: (day === 'Fuera de ruta' || day === 'Sin días programados')
                        ? ['_days', '=', day]
                        : ['_days', 'contains', day]
                })),
            },
            lookup: {
                dataSource: activeDaysLookup,
                valueExpr: "id",
                displayExpr: "name"
            }
        },
        {
            dataField: "address",
            caption: "Dirección",
            width: "auto",
            allowHeaderFiltering: false,
            allowSearch: true,
        },
        {
            dataField: "_supraCanal",
            caption: "Canal Raíz",
            width: 120,
            allowGrouping: true,
            visible: false,
            allowHeaderFiltering: true,
            lookup: {
                dataSource: supraCanalOptions,
            }
        },
        {
            dataField: "_canal",
            caption: "Canal de Venta",
            width: 120,
            allowGrouping: true,
            visible: false,
            allowHeaderFiltering: true,
            lookup: {
                dataSource: canalOptions,
            }
        },
        {
            dataField: "_canalDistr",
            caption: "Canal de Distr.",
            width: 120,
            visible: false,
            allowGrouping: true,
            allowHeaderFiltering: true,
            lookup: {
                dataSource: canalDistrOptions,
            }
        },
    ], [activeDaysLookup, canalDistrOptions, canalOptions, daysOptions, portfolioOptions, supraCanalOptions]);

    return (
        <div className="w-full h-[calc(100vh-10rem)] flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-main">{title}</h2>
                    <p className="text-main/60 text-sm">{description}</p>
                </div>
            </div>

            <div className="flex-grow min-h-0 bg-primary-950/40 backdrop-blur-xl rounded-dx border border-main/10 overflow-hidden relative p-2.5 shadow-xs">
                <GenericDataGrid
                    dataSource={flattenedClients}
                    keyExpr="_rowKey"
                    columns={columns}
                    height="100%"
                    width="100%"
                    remoteOperations={false}
                    showBorders={false}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                    rowAlternationEnabled={true}
                    hoverStateEnabled={true}
                    showDefaultToolbarItems={false}
                    loadPanel={{ enabled: historyLoading, showPane: false }}
                    selection={{ mode: 'none' }}
                    grouping={{ autoExpandAll: false, allowCollapsing: true }}
                    groupPanel={{ visible: true, emptyPanelText: "Arrastra una columna aquí para agrupar" }}
                    searchPanel={{
                        visible: true,
                        highlightSearchText: true,
                        placeholder: 'Buscar...',
                        width: 300
                    }}
                    headerFilter={true}
                    filterRow={true}
                    scrolling={{ mode: 'virtual', rowRenderingMode: 'virtual' }}
                    paging={{ pageSize: 100, pageSizes: [50, 100, 200] }}
                    columnChooser={{ enabled: true, mode: "select", allowSearch: true, title: "Seleccionar Columnas" }}
                    summary={{
                        calculateCustomSummary: calculateUniqueClients,
                        groupItems: [
                            {
                                summaryType: 'count',
                                displayFormat: '{0} cliente/s'
                            }
                        ],
                        totalItems: [
                            {
                                name: 'uniqueClients',
                                showInColumn: 'name',
                                summaryType: 'custom',
                                displayFormat: 'Total: {0} cliente/s'
                            }
                        ]
                    }}
                />
            </div>
            <div className="grid grid-cols-4 gap-3 shrink-0 p-1.5 bg-primary-950/40 backdrop-blur-md border border-main/10 rounded-dx shadow-xs">
                {KPI_CONFIG.map((item) => (
                    <ClientsKpiItem
                        key={item.key}
                        item={item}
                        values={stats[item.key]}
                        isLoading={false}
                    />
                ))}
            </div>
        </div>
    );
};

export default BaseClientsList;

