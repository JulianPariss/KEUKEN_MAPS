import { GenericDataGrid, type IGenericDataGridColumn } from '@repo/devextreme';
import { memo, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { changeFocus } from '../../../../../store/slices/driverObserver/driversSlice';
import { useViewRef } from '../../../../../utils/hooks/map/useContextRef';
import { LoadingIcon, MapIcon } from '@repo/icons';
import { formatMoney } from '../../../../../utils/helpers/formatters';
import { THEME_TOKENS } from '@repo/ui/theme';

type TKPISKeys = 'total' | 'deliveries' | 'invoices' | 'cash';
type TVariants = 'ok' | 'info' | 'warning' | 'danger';

interface IKpiItem {
    key: TKPISKeys;
    title: string;
    type: TVariants;
}

const KPI_CONFIG: IKpiItem[] = [
    { key: 'total', title: 'Conductores', type: 'info' },
    { key: 'deliveries', title: 'Repartos Totales', type: 'ok' },
    { key: 'invoices', title: 'Facturas Totales', type: 'ok' },
    { key: 'cash', title: 'Efectivo Total', type: 'warning' },
];

const DriversKpiItem = memo(({ item, value, isLoading }: {
    item: IKpiItem;
    value: string | number;
    isLoading: boolean;
}) => {
    return (
        <div
            className={`
                flex-1 flex items-center justify-between p-2 rounded-dx border transition-all select-none shadow-xs backdrop-blur-md
                ${item.type === 'ok' ? 'bg-success/20 border-success/40 text-success' :
                    item.type === 'info' ? 'bg-focus-500/20 border-focus-500/40 text-focus-300' :
                        item.type === 'warning' ? 'bg-warning/20 border-warning/40 text-warning' :
                            'bg-error/20 border-error/40 text-error'}
            `}
        >
            {isLoading ? (
                <LoadingIcon className="animate-spin size-5 fill-main mb-1" />
            ) : (
                <span className="text-xl text-main font-bold">
                    {typeof value === 'number' && item.key === 'cash'
                        ? `$ ${formatMoney(value)}`
                        : value}
                </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-medium text-main/80 text-center">{item.title}</span>
        </div>
    );
});

DriversKpiItem.displayName = 'DriversKpiItem';

export interface IFlattenedDriverRow {
    _rowKey: string;
    id: number;
    name: string;
    phoneNumber?: string;
    color?: string;
    deliveriesCount: number;
    deliveriesIds: number[];
    invoicesCount: number;
    bulks: number;
    weight: number;
    totalInCash: number;
    totalInCheckingAccount: number;
    totalAmount: number;
    status: string;
}

interface IDriversListProps {
    title?: string;
    description?: string;
}

const DriversList = ({
    title = 'Listado de Conductores',
    description = 'Monitoreo en tiempo real del estado de los conductores y sus repartos asignados.',
}: IDriversListProps) => {
    const dispatch = useAppDispatch();
    const { setView } = useViewRef();

    const { drivers, loading: driversLoading } = useAppSelector((state) => state.drivers);
    const { deliveriesByDriverId, loading: deliveriesLoading } = useAppSelector((state) => state.deliveries);

    const flattenedDrivers = useMemo(() => {
        return drivers.map((driver): IFlattenedDriverRow => {
            const driverDeliveries = deliveriesByDriverId[driver.id] ?? [];

            let bulks = 0;
            let invoicesCount = 0;
            let totalInCash = 0;
            let totalInCheckingAccount = 0;
            let weight = 0;
            const deliveriesIds: number[] = [];

            let completedCount = 0;
            let inProgressCount = 0;

            for (const d of driverDeliveries) {
                bulks += Number(d.bulks || 0);
                invoicesCount += Number(d.invoicesCount || 0);
                totalInCash += Number(d.totalInCash || 0);
                totalInCheckingAccount += Number(d.totalInCheckingAccount || 0);
                weight += Number(d.weight || 0);
                deliveriesIds.push(d.id);

                const statusUpper = (d.status || '').toUpperCase();
                if (statusUpper === 'COMPLETED' || statusUpper === 'FINALIZADO') {
                    completedCount++;
                } else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'EN_CURSO') {
                    inProgressCount++;
                }
            }

            let status = 'SIN_REPARTO';
            if (driverDeliveries.length > 0) {
                if (completedCount === driverDeliveries.length) {
                    status = 'COMPLETED';
                } else if (inProgressCount > 0) {
                    status = 'IN_PROGRESS';
                } else {
                    status = 'PENDING';
                }
            }

            return {
                _rowKey: String(driver.id),
                id: driver.id,
                name: driver.name,
                phoneNumber: driver.phoneNumber,
                color: driver.color,
                deliveriesCount: driverDeliveries.length,
                deliveriesIds,
                invoicesCount,
                bulks,
                weight,
                totalInCash,
                totalInCheckingAccount,
                totalAmount: totalInCash + totalInCheckingAccount,
                status,
            };
        });
    }, [drivers, deliveriesByDriverId]);

    const stats = useMemo(() => {
        let deliveries = 0;
        let invoices = 0;
        let cash = 0;

        for (const d of flattenedDrivers) {
            deliveries += d.deliveriesCount;
            invoices += d.invoicesCount;
            cash += d.totalInCash;
        }

        return {
            total: flattenedDrivers.length,
            deliveries,
            invoices,
            cash,
        };
    }, [flattenedDrivers]);

    const ActionCell = (data: any) => {
        const d = data.data as IFlattenedDriverRow;
        return (
            <div className="flex justify-center">
                <button
                    onClick={() => {
                        dispatch(changeFocus(d.id));
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

    const StatusCell = (data: any) => {
        const state = data.value;
        let dotColor = 'bg-main/30';
        let label = 'Sin Repartos';

        if (state === 'COMPLETED') {
            dotColor = 'bg-success';
            label = 'Completado';
        } else if (state === 'IN_PROGRESS') {
            dotColor = 'bg-warning';
            label = 'En Curso';
        } else if (state === 'PENDING') {
            dotColor = 'bg-main/40';
            label = 'Pendiente';
        } else if (state === 'CANCELLED') {
            dotColor = 'bg-error';
            label = 'Cancelado';
        }

        return (
            <div className="flex items-center justify-center gap-1.5">
                <span className={`size-1 rounded-full shrink-0 ${dotColor}`} />
                <span className="text-xs text-main font-medium">{label}</span>
            </div>
        );
    };

    const columns: IGenericDataGridColumn[] = useMemo(() => [
        {
            name: 'actions',
            dataField: 'actions',
            caption: 'Acciones',
            width: 75,
            alignment: 'center',
            allowFiltering: false,
            allowSorting: false,
            allowGrouping: false,
            cellRender: ActionCell,
            allowHiding: false,
        },
        {
            dataField: 'id',
            caption: 'ID',
            width: 75,
            alignment: 'center',
            allowHiding: false,
            allowHeaderFiltering: false,
            allowSearch: true,
            cellRender: (data: any) => (
                <span className="font-mono text-main/80 font-semibold text-xs">
                    #{data.value}
                </span>
            ),
        },
        {
            dataField: 'name',
            caption: 'Conductor',
            width: 220,
            sortOrder: 'asc',
            allowHiding: false,
            allowHeaderFiltering: false,
            allowSearch: true,
            cellRender: (data: any) => (
                <div className="flex items-center gap-2">
                    <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: data.data.color || THEME_TOKENS.status.info }}
                    />
                    <span className="font-medium text-main text-xs truncate" title={data.value}>
                        {data.value}
                    </span>
                </div>
            ),
        },
        {
            dataField: 'status',
            caption: 'Estado',
            width: 125,
            alignment: 'center',
            allowGrouping: true,
            allowHeaderFiltering: true,
            cellRender: StatusCell,
            lookup: {
                dataSource: [
                    { id: 'COMPLETED', name: 'Completado' },
                    { id: 'IN_PROGRESS', name: 'En Curso' },
                    { id: 'PENDING', name: 'Pendiente' },
                    { id: 'SIN_REPARTO', name: 'Sin Repartos' },
                ],
                valueExpr: 'id',
                displayExpr: 'name',
            },
        },
        {
            dataField: 'deliveriesCount',
            caption: 'Repartos',
            width: 95,
            alignment: 'center',
            dataType: 'number',
            allowGrouping: true,
            allowHeaderFiltering: true,
            cellRender: (data: any) => (
                <span className="font-mono font-bold text-focus-300 text-xs">
                    {data.value ?? 0}
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
            dataField: 'bulks',
            caption: 'Bultos',
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
            dataField: 'weight',
            caption: 'Peso',
            width: 110,
            alignment: 'right',
            dataType: 'number',
            allowGrouping: false,
            allowHeaderFiltering: false,
            cellRender: (data: any) => (
                <span className="font-mono font-semibold text-main/80 text-xs">
                    {Number(data.value || 0).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
                </span>
            ),
        },
        {
            dataField: 'totalInCash',
            caption: 'Total Efectivo',
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
            dataField: 'totalInCheckingAccount',
            caption: 'Total Cta. Cte.',
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
            dataField: 'phoneNumber',
            caption: 'Teléfono',
            width: 130,
            visible: false,
            allowHeaderFiltering: false,
            allowSearch: true,
        },
    ], []);

    const isLoading = driversLoading || deliveriesLoading;

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
                    dataSource={flattenedDrivers}
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
                    loadPanel={{ enabled: isLoading, showPane: false }}
                    selection={{ mode: 'none' }}
                    grouping={{ autoExpandAll: false, allowCollapsing: true }}
                    groupPanel={{ visible: true, emptyPanelText: 'Arrastra una columna aquí para agrupar' }}
                    searchPanel={{
                        visible: true,
                        highlightSearchText: true,
                        placeholder: 'Buscar conductor...',
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
                                displayFormat: '{0} conductores',
                            },
                            {
                                column: 'deliveriesCount',
                                summaryType: 'sum',
                                displayFormat: 'Total: {0}',
                            },
                            {
                                column: 'invoicesCount',
                                summaryType: 'sum',
                                displayFormat: 'Total: {0}',
                            },
                            {
                                column: 'bulks',
                                summaryType: 'sum',
                                displayFormat: 'Total: {0}',
                            },
                            {
                                column: 'weight',
                                summaryType: 'sum',
                                displayFormat: 'Total: {0} kg',
                                valueFormat: { type: 'fixedPoint', precision: 1 } as any,
                            },
                            {
                                column: 'totalInCash',
                                summaryType: 'sum',
                                displayFormat: 'Total: ${0}',
                                valueFormat: { type: 'fixedPoint', precision: 2 } as any,
                            },
                            {
                                column: 'totalInCheckingAccount',
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
                    <DriversKpiItem
                        key={item.key}
                        item={item}
                        value={stats[item.key]}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    );
};

export default DriversList;
