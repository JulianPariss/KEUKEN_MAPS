import { useAppSelector } from "../../../../../../../store/hooks";
import type { IHistoryClient, IHistoryPortfolio } from "../../../../../../../utils/types/sellerObserver/history.types";
import Spinner from "../../../../../../spinner";
import SelectInput from "../../../../../../table/selectInput";
import Table, { type ColumnType } from "../../../../../../table/table";


import { memo, useMemo } from "react";

const getDaysToVisit = (record: IHistoryClient) => {
    const daysToVisit = [];
    if (record.monday) daysToVisit.push('Lunes');
    if (record.tuesday) daysToVisit.push('Martes');
    if (record.wednesday) daysToVisit.push('Miercoles');
    if (record.thursday) daysToVisit.push('Jueves');
    if (record.friday) daysToVisit.push('Viernes');
    if (record.saturday) daysToVisit.push('Sabado');
    if (record.sunday) daysToVisit.push('Domingo');

    return daysToVisit;
}

const daysToVisitOptions = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map((day) => {
    return {
        key: day,
        id: day,
        value: day,
        label: day,
    };
});

const DaysToVisitCell = memo(({ record, onModalSubmit = () => { } }: { record: IHistoryClient, onModalSubmit?: (v: any) => void }) => {
    const daysToVisit = getDaysToVisit(record);
    const options = useMemo(() => daysToVisit.map((day) => ({
        key: day,
        id: day,
        value: day,
        label: day,
    })), [daysToVisit.length]); // fast diff

    return (
        <SelectInput
            value={null}
            variant="popover"
            placeholder={
                daysToVisit.length === 1 ? daysToVisit[0] : daysToVisit.length > 1 ? `${daysToVisit.length} días` : 'Sin días de visita'
            }
            onChange={() => {
                onModalSubmit(record);
            }}
            options={options}
            disablePopover={daysToVisit.length <= 1}
        />
    );
});

const TagsCell = memo(({ record, onModalSubmit = () => { } }: { record: IHistoryClient, onModalSubmit?: (v: any) => void }) => {
    const options = useMemo(() => record.tags.reduce((acc, tag) => {
        tag.labels.forEach((label) => {
            acc.push({
                key: `${tag.key}-${label}`,
                id: `${tag.key}-${label}`,
                value: `${tag.key}-${label}`,
                label: label,
            });
        });
        return acc;
    }, [] as any[]), [record.tags]);

    return (
        <SelectInput
            value={null}
            variant="popover"
            placeholder={record.tags.length > 0 ? `Etiquetas: (${record.tags.length})` : "Sin etiquetas"}
            onChange={() => {
                onModalSubmit(record);
            }}
            options={options}
            disablePopover={record.tags.length === 0}
        />
    );
});

const ClientsTableModal = () => {
    const clients = useAppSelector((state) => state.history.clients);
    const historyLoading = useAppSelector((state) => state.history.loading);

    const portfoliosById = useAppSelector((state) => state.portfolio.portfoliosById);
    const porfolios = useAppSelector((state) => state.portfolio.porfolios);
    const portfolioLoading = useAppSelector((state) => state.portfolio.loading);

    const sellers = useAppSelector((state) => state.sellers.sellerById);
    const sellersLoading = useAppSelector((state) => state.sellers.loading);

    const clientsTagList = useAppSelector((state) => state.tags.clientsTagList);

    const isLoading = historyLoading || portfolioLoading || sellersLoading;

    const columns: ColumnType<any>[] = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            visible: true,
            width: '140px',
            searchable: true,
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            width: '200px',
            searchable: true,
        },
        {
            title: 'Dirección',
            dataIndex: 'address',
        },
        {
            title: 'Días de visita',
            dataIndex: 'daysToVisit',
            selectbox: true,
            groupable: true,
            options: daysToVisitOptions,
            hint: (_, record: IHistoryClient) => getDaysToVisit(record).join(', '),
            render: (_, record: IHistoryClient) => {
                return (
                    <DaysToVisitCell record={record} />
                );
            },
            width: '180px',
            groupValue: (record: IHistoryClient) => {
                return getDaysToVisit(record).join(', ');
            }
        },
        {
            title: 'Vendedor',
            dataIndex: 'mobileUser',
            groupable: true,
            width: '200px',
            hint: (value: number) => `${sellers[value]?.sellerName ?? 'Sin vendedor'} - ${value ? `#${value}` : ''}`,
            render: (value: number) => {
                return sellers[value]?.sellerName;
            },
            groupRender: (value: string) => {
                const sellerId = parseInt(value);
                return `${sellers[sellerId]?.sellerName ?? ''} #${value}`;
            },
            searchable: true,
            onSearch: (value: number, searchText: string) => {
                const sellerName = sellers[value]?.sellerName || '';
                const sellerId = String(value);
                const search = searchText.toLowerCase();

                return sellerName.toLowerCase().includes(search) || sellerId.includes(search);
            }
        },
        {
            title: 'Cartera',
            dataIndex: 'portfolios',
            groupable: true,
            width: '200px',
            hint: (value: IHistoryPortfolio[]) => value ? value.map((portfolio) => porfolios[portfoliosById[portfolio.id]]?.name).join(', ') : 'Sin cartera',
            render: (value: IHistoryPortfolio[]) => {
                return value.map((portfolio) => porfolios[portfoliosById[portfolio.id]]?.name).join(', ');
            },
            groupRender: (value: string) => {
                const portfolioId = parseInt(value);
                return `${porfolios[portfoliosById[portfolioId]]?.name ?? 'Sin cartera'}`;
            },
            searchable: true,
            onSearch: (value: number, searchText: string) => {
                const portfolioName = porfolios[portfoliosById[value]]?.name || '';
                const search = searchText.toLowerCase();

                return portfolioName.toLowerCase().includes(search) || value.toString().includes(search);
            }
        },
        {
            title: 'Etiquetas',
            dataIndex: 'tags',
            width: '200px',
            selectbox: true,
            hint: (_, record: IHistoryClient) => record.tags.flatMap(tag => tag.labels.map(label => `${tag.key}-${label}`)).join(', '),
            groupValue: (record: IHistoryClient) => {
                return record.tags.flatMap(tag => tag.labels.map(label => `${tag.key}-${label}`));
            },
            options: clientsTagList.reduce((acc, tag) => {
                tag.labels.map((label) => {
                    acc.push({
                        key: `${tag.key}-${label}`,
                        id: `${tag.key}-${label}`,
                        value: `${tag.key}-${label}`,
                        label: label,
                    });
                })
                return acc;
            }, [] as any[]),
            render: (_, record: IHistoryClient) => {
                return (
                    <TagsCell record={record} />
                );
            }
        }
    ], [sellers, porfolios, portfoliosById, clientsTagList]);

    return (
        <div className="w-[90vw] max-w-[1500px] h-[60vh] flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white">Listado de Clientes</h2>
                    <p className="text-white/50 text-sm">Explora y filtra el listado completo de clientes.</p>
                </div>
            </div>

            {isLoading ? (
                <Spinner bgColor="bg-primary-light" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={clients}
                    rowKey="id"
                    accordion
                    defaultExpandedGroups={'none'}
                    collapsible
                    height="100%"
                />
            )}
        </div>
    );
};


export default ClientsTableModal;