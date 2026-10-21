import { GenericDataGrid, type IGenericDataGridColumn } from '@repo/devextreme';
import { memo, useMemo } from 'react';
import { useAppSelector } from '../../../../../store/hooks';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { LoadingIcon } from '@repo/icons';
import { formatMoney } from '../../../../../utils/helpers/formatters';
import { deliveryClientKey } from '../../../../../store/slices/driverObserver/clientsSlice';

type TKPISKeys = 'total' | 'processed' | 'visited' | 'delivered';
type TVariants = 'danger' | 'warning' | 'ok' | 'info';

interface IKpiItem {
    key: TKPISKeys;
    title: string;
    type: TVariants;
}

const KPI_CONFIG: IKpiItem[] = [
    { key: 'total', title: 'Total Clientes', type: 'info' },
    { key: 'processed', title: 'Completados', type: 'ok' },
    { key: 'visited', title: 'Visitados', type: 'warning' },
    { key: 'delivered', title: 'Entregados', type: 'ok' },
];

const ClientsKpiItem = memo(({ item, value, isLoading }: {
    item: IKpiItem;
    value: number;
    isLoading: boolean;
}) => {
    const hasValues = value > 0;

    return (
        <div
            className={`
                flex-1 flex items-center justify-between p-2 rounded-dx border transition-all select-none shadow-xs backdrop-blur-md
                ${item.type === 'danger' ? 'bg-error/20 border-error/40 text-error' :
                    item.type === 'warning' ? 'bg-warning/20 border-warning/40 text-warning' :
                        item.type === 'info' ? 'bg-focus-500/20 border-focus-500/40 text-focus-300' :
                            'bg-focus-300/20 border-focus-300/40 text-focus-300'}
                ${!hasValues && 'opacity-40 grayscale pointer-events-none border-main/10 bg-primary-500/10 text-main/40'}
            `}
        >
            {isLoading ? (
                <LoadingIcon className="animate-spin size-5 fill-main mb-1" />
            ) : (
                <span className="text-xl text-main font-bold">{value}</span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-medium text-main/80 text-center">{item.title}</span>
        </div>
    );
});

ClientsKpiItem.displayName = 'ClientsKpiItem';

export interface IFlattenedDeliveryClient extends IFDeliveryClient {
    _rowKey: string;
    deliveryId?: number;
    invoicesTotalAmount: number;
}

interface IClientsListProps {
    title?: string;
    description?: string;
}

const ClientsList = ({
    title = 'Estado de Clientes y Repartos',
    description = 'Listado y seguimiento del estado de entrega de clientes por reparto.',
}: IClientsListProps) => {
    const { clients, clientByDeliveryKey, clientIdsByDeliveryId, loading } = useAppSelector(
        (state) => state.deliveryClients
    );

    const flattenedClients = useMemo(() => {
        const result: IFlattenedDeliveryClient[] = [];
        const entries = Object.entries(clientIdsByDeliveryId);

        if (entries.length > 0) {
            for (const [deliveryIdStr, clientIds] of entries) {
                const numDeliveryId = Number(deliveryIdStr);
                for (const clientId of clientIds) {
                    const client =
                        clientByDeliveryKey[deliveryClientKey(numDeliveryId, clientId)];
                    if (!client) continue;

                    const totalAmount = (client.invoicesTotal || []).reduce(
                        (acc, curr) => acc + (Number(curr.amount) || 0),
                        0
                    );

                    result.push({
                        ...client,
                        _rowKey: `${numDeliveryId}_${client.id || client.clientId}`,
                        deliveryId: numDeliveryId,
                        invoicesTotalAmount: totalAmount,
                    });
                }
            }
        } else if (clients && clients.length > 0) {
            for (const client of clients) {
                const totalAmount = (client.invoicesTotal || []).reduce(
                    (acc, curr) => acc + (Number(curr.amount) || 0),
                    0
                );

                result.push({
                    ...client,
                    _rowKey: String(client.id || client.clientId),
                    deliveryId: undefined,
                    invoicesTotalAmount: totalAmount,
                });
            }
        }

        return result;
    }, [clientIdsByDeliveryId, clientByDeliveryKey, clients]);

    const stats = useMemo(() => {
        let processed = 0;
        let visited = 0;
        let delivered = 0;

        for (const item of flattenedClients) {
            if (item.isProcessed) processed++;
            if (item.isVisited) visited++;
            if (item.isDelivered) delivered++;
        }

        return {
            total: flattenedClients.length,
            processed,
            visited,
            delivered,
        };
    }, [flattenedClients]);

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            dataField: 'deliveryId',
            caption: 'Reparto',
            width: 105,
            alignment: 'center',
            allowGrouping: true,
            allowHeaderFiltering: true,
            allowSearch: true,
            allowHiding: false,
            cellRender: (data: any) => (
                <span className="font-mono text-focus-300 font-bold text-xs">
                    {data.value ? `#${data.value}` : '-'}
                </span>
            ),
        },
        {
            dataField: 'clientId',
            caption: 'ID Cliente',
            width: 100,
            alignment: 'center',
            allowGrouping: false,
            allowHeaderFiltering: false,
            allowSearch: true,
            allowHiding: false,
            calculateCellValue: (row: any) => row.clientId ?? row.id,
            cellRender: (data: any) => (
                <span className="font-mono text-main/80 font-semibold text-xs">
                    #{data.value ?? '-'}
                </span>
            ),
        },
        {
            dataField: 'name',
            caption: 'Cliente',
            width: 250,
            sortOrder: 'asc',
            allowHiding: false,
            allowHeaderFiltering: false,
            allowSearch: true,
            cellRender: (data: any) => (
                <span className="font-medium text-main truncate block text-xs" title={data.value}>
                    {data.value || '-'}
                </span>
            ),
        },
        {
            dataField: 'invoicesCount',
            caption: 'Facturas',
            width: 95,
            alignment: 'center',
            dataType: 'number',
            allowGrouping: true,
            allowHeaderFiltering: true,
            cellRender: (data: any) => (
                <span className="font-mono font-bold text-main/90 text-xs">
                    {data.value ?? 0}
                </span>
            ),
        },
        {
            dataField: 'invoicesTotalAmount',
            caption: 'Total Facturado',
            width: 140,
            alignment: 'right',
            dataType: 'number',
            allowGrouping: false,
            allowHeaderFiltering: false,
            cellRender: (data: any) => (
                <span className="font-mono font-bold text-focus-300 text-xs">
                    ${formatMoney(data.value || 0)}
                </span>
            ),
        },
        {
            dataField: 'isProcessed',
            caption: 'Completado',
            width: 115,
            alignment: 'center',
            dataType: 'boolean',
            allowGrouping: true,
            allowHeaderFiltering: true,
            calculateCellValue: (row: any) => Boolean(row.isProcessed),
            trueText: 'Completado',
            falseText: 'Pendiente',
            cellRender: (data: any) => {
                const val = Boolean(data.value);
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <span
                            className={`size-1 rounded-full shrink-0 ${val ? 'bg-success' : 'bg-warning'
                                }`}
                        />
                        <span className="text-xs text-main font-medium">
                            {val ? 'Completado' : 'Pendiente'}
                        </span>
                    </div>
                );
            },
        },
        {
            dataField: 'isVisited',
            caption: 'Visitado',
            width: 115,
            alignment: 'center',
            dataType: 'boolean',
            allowGrouping: true,
            allowHeaderFiltering: true,
            calculateCellValue: (row: any) => Boolean(row.isVisited),
            trueText: 'Visitado',
            falseText: 'Sin Visitar',
            cellRender: (data: any) => {
                const val = Boolean(data.value);
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <span
                            className={`size-1 rounded-full shrink-0 ${val ? 'bg-success' : 'bg-error'
                                }`}
                        />
                        <span className="text-xs text-main font-medium">
                            {val ? 'Visitado' : 'Sin Visitar'}
                        </span>
                    </div>
                );
            },
        },
        {
            dataField: 'isDelivered',
            caption: 'Entregado',
            width: 115,
            alignment: 'center',
            dataType: 'boolean',
            allowGrouping: true,
            allowHeaderFiltering: true,
            calculateCellValue: (row: any) => Boolean(row.isDelivered),
            trueText: 'Entregado',
            falseText: 'Pendiente',
            cellRender: (data: any) => {
                const val = Boolean(data.value);
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <span
                            className={`size-1 rounded-full shrink-0 ${val ? 'bg-success' : 'bg-warning'
                                }`}
                        />
                        <span className="text-xs text-main font-medium">
                            {val ? 'Entregado' : 'Pendiente'}
                        </span>
                    </div>
                );
            },
        },
        {
            dataField: 'address',
            caption: 'Dirección',
            width: 200,
            visible: false,
            allowHeaderFiltering: false,
            allowSearch: true,
        },
        {
            dataField: 'city',
            caption: 'Ciudad',
            width: 140,
            visible: false,
            allowHeaderFiltering: true,
            allowGrouping: true,
        },
        {
            dataField: 'zone',
            caption: 'Zona',
            width: 120,
            visible: false,
            allowHeaderFiltering: true,
            allowGrouping: true,
        },
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
                    loadPanel={{ enabled: loading, showPane: false }}
                    selection={{ mode: 'none' }}
                    grouping={{ autoExpandAll: false, allowCollapsing: true }}
                    groupPanel={{ visible: true, emptyPanelText: 'Arrastra una columna aquí para agrupar' }}
                    searchPanel={{
                        visible: true,
                        highlightSearchText: true,
                        placeholder: 'Buscar cliente, reparto...',
                        width: 300,
                    }}
                    headerFilter={true}
                    filterRow={true}
                    scrolling={{ mode: 'virtual', rowRenderingMode: 'virtual' }}
                    paging={{ pageSize: 100, pageSizes: [50, 100, 200] }}
                    columnChooser={{ enabled: true, mode: 'select', allowSearch: true, title: 'Seleccionar Columnas' }}
                    summary={{
                        totalItems: [
                            {
                                column: 'name',
                                summaryType: 'count',
                                displayFormat: '{0} clientes',
                            },
                            {
                                column: 'invoicesCount',
                                summaryType: 'sum',
                                displayFormat: 'Total: {0}',
                            },
                            {
                                column: 'invoicesTotalAmount',
                                summaryType: 'sum',
                                displayFormat: 'Total: ${0}',
                                valueFormat: { type: 'fixedPoint', precision: 2 } as any,
                            },
                        ],
                        groupItems: [
                            {
                                summaryType: 'count',
                                displayFormat: '{0} clientes',
                            },
                            {
                                column: 'invoicesTotalAmount',
                                summaryType: 'sum',
                                displayFormat: 'Total: ${0}',
                                valueFormat: { type: 'fixedPoint', precision: 2 } as any,
                            },
                        ],
                    }}
                />
            </div>

            <div className="grid grid-cols-4 gap-3 shrink-0 p-1.5 bg-primary-950/40 backdrop-blur-md border border-main/10 rounded-dx shadow-xs">
                {KPI_CONFIG.map((item) => (
                    <ClientsKpiItem
                        key={item.key}
                        item={item}
                        value={stats[item.key]}
                        isLoading={loading}
                    />
                ))}
            </div>
        </div>
    );
};

export default ClientsList;
