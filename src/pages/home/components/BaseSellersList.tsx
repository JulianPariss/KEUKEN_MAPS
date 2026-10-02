import { GenericDataGrid, type IGenericDataGridColumn } from '@repo/devextreme';
import { memo, useMemo } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { changeFocus } from "../../../store/slices/sellerObserver/sellersSlice";
import { useViewRef } from "../../../utils/hooks/map/useContextRef";
import type { ISeller } from "../../../utils/types/sellerObserver/sellers.types";
import { LoadingIcon, MapIcon } from '@repo/icons';

type TKPISKeys = 'total' | 'orders' | 'amount' | 'progress';
type TVariants = 'ok' | 'info' | 'warning' | 'danger';

interface IKpiItem {
    key: TKPISKeys;
    title: string;
    type: TVariants;
}

const KPI_CONFIG: IKpiItem[] = [
    { key: 'total', title: 'Vendedores', type: 'info' },
    { key: 'orders', title: 'Pedidos Totales', type: 'ok' },
    { key: 'amount', title: 'Monto Total', type: 'ok' },
    { key: 'progress', title: 'Visitas (Promedio)', type: 'warning' }
];

const calculateStats = (sellers: ISeller[]) => {
    const totalSellers = sellers.length;
    const totalOrders = sellers.reduce((acc, s) => acc + (s.orders_count || 0), 0);
    const totalAmount = sellers.reduce((acc, s) => acc + (s.total_amount || 0), 0);

    const totalVisited = sellers.reduce((acc, s) => acc + (s.visited_clients || 0), 0);
    const totalInRoute = sellers.reduce((acc, s) => acc + (s.clients_in_route_total || 0), 0);
    const avgProgress = totalInRoute > 0 ? (totalVisited / totalInRoute) * 100 : 0;

    return {
        total: totalSellers,
        orders: totalOrders,
        amount: totalAmount,
        progress: `${avgProgress.toFixed(1)}%`
    };
};

const SellersKpiItem = memo(({ item, value, isLoading }: {
    item: IKpiItem,
    value: string | number,
    isLoading: boolean,
}) => {
    return (
        <div
            className={`
                flex-1 flex items-center justify-between p-3 rounded-dx border transition-all select-none shadow-xs backdrop-blur-md
                ${item.type === 'ok' ? 'bg-success/20 border-success/40 text-success' :
                    item.type === 'info' ? 'bg-info/20 border-info/40 text-info' :
                        item.type === 'warning' ? 'bg-warning/20 border-warning/40 text-warning' :
                            'bg-error/20 border-error/40 text-error'}
            `}
        >
            {isLoading ? (
                <LoadingIcon className="animate-spin size-5 fill-main mb-1" />
            ) : (
                <span className="text-xl text-main font-bold">
                    {typeof value === 'number' && item.key === 'amount'
                        ? `ARS$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : value}
                </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-medium text-main/80 text-center">{item.title}</span>
        </div>
    );
});

interface BaseSellersListProps {
    sellers: ISeller[];
    sellersLoading: boolean;
    title?: string;
    description?: string;
}

const BaseSellersList = ({
    sellers,
    sellersLoading,
    title = "Listado de Vendedores",
    description = "Monitoreo en tiempo real del desempeño y estado de la ventas."
}: BaseSellersListProps) => {
    const dispatch = useAppDispatch();
    const { setView } = useViewRef();
    const stats = useMemo(() => calculateStats(sellers), [sellers]);

    const ActionCell = (data: any) => {
        const s = data.data as ISeller;
        return (
            <div className="flex justify-center">
                <button
                    onClick={() => {
                        dispatch(changeFocus(s.seller));
                        setView('mapView');
                    }}
                    className="p-0.5 rounded-full bg-focus-500 text-variant border border-focus-300/50 hover:bg-focus-300 transition-all group active:scale-95 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    title="Enfocar en mapa"
                >
                    <MapIcon className="size-3 stroke-variant group-hover:scale-110 transition-transform" />
                </button>
            </div>
        );
    };

    const VisitasCell = (data: any) => {
        const s = data.data as ISeller;
        const progress = s.clients_in_route_total > 0 ? (s.visited_clients / s.clients_in_route_total) * 100 : 0;
        return (
            <div className="relative w-full h-3 bg-primary-500/20 rounded-full overflow-hidden border border-main/10 flex items-center justify-center shadow-inner">
                <div
                    className="absolute left-0 top-0 h-full bg-focus-300/80 border-r border-focus-200 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
                <span className="relative z-10 text-[10px] font-bold text-main px-2 py-0.5 rounded-full bg-primary-950/80 backdrop-blur-xs border border-main/10 shadow-xs leading-none">
                    {s.visited_clients} / {s.clients_in_route_total}
                </span>
            </div>
        );
    };

    const EstadoCell = (data: any) => {
        const state = data.value;
        const isOpen = state === 'OPEN';
        const isClosed = state === 'CLOSED';

        return (
            <div className="flex items-center justify-center gap-1.5">
                <span
                    className={`size-1 rounded-full shrink-0 ${
                        isOpen ? 'bg-success' : isClosed ? 'bg-error' : 'bg-main/30'
                    }`}
                />
                <span className="text-xs text-main font-medium">
                    {isOpen ? 'Abierto' : isClosed ? 'Cerrado' : 'Desconocido'}
                </span>
            </div>
        );
    };

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            name: "actions",
            dataField: "actions",
            caption: "Acciones",
            width: 75,
            alignment: "center",
            allowFiltering: false,
            allowSorting: false,
            allowGrouping: false,
            cellRender: ActionCell,
            allowHiding: false,
        },
        {
            dataField: "seller",
            caption: "ID",
            width: 75,
            alignment: "center",
            allowHiding: false,
            allowHeaderFiltering: false,
            allowSearch: true,
        },
        {
            dataField: "sellerName",
            caption: "Nombre Vendedor",
            width: 220,
            sortOrder: "asc",
            allowHiding: false,
        },
        {
            dataField: "orders_count",
            caption: "Pedidos",
            width: 90,
            alignment: "center",
            allowGrouping: false,
            allowFiltering: false,
        },
        {
            dataField: "total_amount",
            caption: "Monto",
            allowGrouping: false,
            allowFiltering: false,
            width: 250,
            alignment: "right",
            cellRender: (data: any) => `${data.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS$`,
        },
        {
            caption: "Visitas",
            width: "100%",
            alignment: "center",
            cellRender: VisitasCell,
        },
        {
            dataField: "app_version",
            caption: "Versión App",
            width: 120,
            alignment: "center",
            visible: false,
        },
        {
            dataField: "phoneNumber",
            caption: "Teléfono",
            width: 130,
            visible: false,
        },
        {
            dataField: "state",
            caption: "Estado",
            width: 120,
            alignment: "center",
            allowGrouping: true,
            allowHeaderFiltering: true,
            cellRender: EstadoCell,
            lookup: {
                dataSource: [
                    { id: 'OPEN', name: 'Abierto' },
                    { id: 'CLOSED', name: 'Cerrado' },
                    { id: '-', name: 'Desconocido' }
                ],
                valueExpr: "id",
                displayExpr: "name"
            }
        }
    ], []);

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
                    dataSource={sellers}
                    keyExpr="seller"
                    columns={columns}
                    height="100%"
                    width="100%"
                    remoteOperations={false}
                    showBorders={false}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                    rowAlternationEnabled={true}
                    showDefaultToolbarItems={false}
                    loadPanel={{ enabled: sellersLoading, showPane: false }}
                    selection={{ mode: 'none' }}
                    grouping={{ autoExpandAll: false, allowCollapsing: true }}
                    groupPanel={{ visible: true, emptyPanelText: "Arrastra una columna aquí para agrupar" }}
                    searchPanel={{
                        visible: true,
                        highlightSearchText: true,
                        placeholder: "Buscar vendedor...",
                        width: 300
                    }}
                    headerFilter={true}
                    filterRow={true}
                    scrolling={{ mode: 'virtual', rowRenderingMode: 'virtual' }}
                    paging={{ pageSize: 100, pageSizes: [50, 100, 200] }}
                    columnChooser={{ enabled: true, mode: "select", allowSearch: true, title: "Seleccionar Columnas" }}
                    summary={{
                        totalItems: [
                            {
                                column: "sellerName",
                                summaryType: "count",
                                displayFormat: "{0} vendedores",
                            },
                            {
                                column: "orders_count",
                                summaryType: "sum",
                                displayFormat: "Total: {0}",
                            },
                            {
                                column: "total_amount",
                                summaryType: "sum",
                                displayFormat: "Total: ARS$ {0}",
                                valueFormat: { type: 'fixedPoint', precision: 2 } as any,
                            }
                        ]
                    }}
                />
            </div>

            <div className="grid grid-cols-4 gap-3 shrink-0 p-1.5 bg-primary-950/40 backdrop-blur-md border border-main/10 rounded-dx shadow-xs">
                {KPI_CONFIG.map((item) => (
                    <SellersKpiItem
                        key={item.key}
                        item={item}
                        value={stats[item.key]}
                        isLoading={sellersLoading}
                    />
                ))}
            </div>
        </div>
    );
};

export default BaseSellersList;

