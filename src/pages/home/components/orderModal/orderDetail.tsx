import { useEffect, useState } from 'react';
import { getOrderDetail } from "../../../../services/sellers.service"
import { useAppSelector } from "../../../../store/hooks"
import type { IOrderDetail } from '../../../../utils/types/sellerObserver/sellers.types';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import { formatMoney } from '../../../../utils/helpers/formatters';

interface IProps {
    order_id: string;
}

interface ITableHeader {
    id: number;
    key: string;
    width: string;
    title: string;
    prefix?: string;
}


interface IOrderItemProp {
    orderItem: any;
    tableHeaders: ITableHeader[];
}

const OrderItem = (props: IOrderItemProp) => {
    const { orderItem, tableHeaders } = props;

    return (
        <tr className="group shadow-xs transition-colors rounded-dx bg-primary-950/30">
            {tableHeaders.map((column) => (
                <td key={`${column.id}-${orderItem.id}`} className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10 first:border-l first:rounded-l-dx last:border-r last:rounded-r-dx">
                    <div>
                        <p className={`text-sm mx-1.5 ${column.id !== 0 ? 'text-main' : 'text-focus-300 font-mono font-semibold'} whitespace-nowrap`}>
                            {column.prefix && <span className="select-none font-mono font-medium">{column.prefix}</span>}
                            {orderItem[column.key]}
                        </p>
                    </div>
                </td>
            ))}
        </tr>
    );
};

const TableHeader = ({ tableHeaders }: { tableHeaders: ITableHeader[] }) => {
    return (
        tableHeaders.map((header) => (
            <th
                className="text-main text-xs font-bold uppercase tracking-wider text-left p-2.5 bg-primary-950/50 backdrop-blur-md border-y border-main/15 first:border-l first:rounded-l-dx last:border-r last:rounded-r-dx whitespace-nowrap"
                style={{ width: `${header.width}%` }}
                key={header.id}
            >
                {header.title}
            </th>
        ))
    );
};

const OrderDetail = (props: IProps) => {
    const { enterprise } = useAppSelector((state) => state.user);
    const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
    const [isLoading, setIsloading] = useState<boolean>(true);

    useEffect(() => {
        setIsloading(true);
        getOrderDetail({ enterprise: enterprise.enterprise_id.toString(), order_id: props.order_id })
            .then((res) => {
                setOrderDetail(res);
            })
            .catch(() => {
                // Silently catch order detail fetch errors
            })
            .finally(() => setIsloading(false));
    }, []);

    const tableHeaders: ITableHeader[] = [
        {
            id: 0,
            key: 'code',
            title: 'Artículo',
            width: '5',
            prefix: '#'
        },
        {
            id: 1,
            key: 'description',
            title: 'Descripción',
            width: '25'
        },
        {
            id: 2,
            key: 'quantity',
            title: 'Cantidad',
            width: '5'
        },
        {
            id: 3,
            key: 'unitValue',
            title: 'Precio/U',
            width: '8',
            prefix: '$'
        },
        {
            id: 4,
            key: 'totalValue',
            title: 'Precio Total',
            width: '8',
            prefix: '$'
        },
        {
            id: 5,
            key: 'promoId',
            title: 'Promo',
            width: '5'
        },
        {
            id: 6,
            key: 'discount',
            title: 'Descuento',
            width: '5',
            prefix: '$'
        }
    ];

    return (
        <div className="overflow-y-auto h-[450px] md:h-[350px]">
            {!isLoading ? (
                orderDetail ? (
                    <>
                        {/* Desktop Table View */}
                        <table className="hidden lg:table w-full border-separate" style={{ borderSpacing: '0 6px' }}>
                            <thead>
                                <tr className="sticky top-0 backdrop-blur-md shadow-xs z-10">
                                    <TableHeader tableHeaders={tableHeaders} />
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetail.items.map((e) => {
                                    const formattedData = {
                                        unitValue: formatMoney(e.unitValue),
                                        totalValue: formatMoney(e.totalValue)
                                    };

                                    return <OrderItem key={e.id} orderItem={{ ...e, ...formattedData }} tableHeaders={tableHeaders} />;
                                })}
                            </tbody>
                        </table>

                        {/* Mobile/Tablet Card View */}
                        <div className="lg:hidden flex flex-col gap-y-3 pb-4">
                            {orderDetail.items.map((item) => (
                                <div key={item.id} className="p-3.5 rounded-dx bg-primary-950/40 backdrop-blur-xl border border-main/10 shadow-xs">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="text-focus-300 text-xs font-bold font-mono uppercase mb-0.5">#{item.code}</p>
                                            <p className="text-main font-semibold text-sm leading-snug">{item.description}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-main font-bold text-base">${formatMoney(item.totalValue)}</p>
                                            <p className="text-[10px] text-main/40 uppercase font-medium">Total</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 mt-2 border-t border-main/10">
                                        <div>
                                            <p className="text-main/50 text-[9px] uppercase font-bold tracking-wider mb-0.5">Cantidad</p>
                                            <p className="text-main text-sm font-medium">{item.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-main/50 text-[9px] uppercase font-bold tracking-wider mb-0.5">Precio/U</p>
                                            <p className="text-main text-sm font-medium">${formatMoney(item.unitValue)}</p>
                                        </div>
                                        {item.promoId && (
                                            <div>
                                                <p className="text-main/50 text-[9px] uppercase font-bold tracking-wider mb-0.5">Promo</p>
                                                <p className="text-focus-300 text-sm font-mono">{item.promoId}</p>
                                            </div>
                                        )}
                                        {item.discount > 0 && (
                                            <div>
                                                <p className="text-main/50 text-[9px] uppercase font-bold tracking-wider mb-0.5">Descuento</p>
                                                <p className="text-error text-sm font-medium">-${formatMoney(item.discount)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <Empty />
                )
            ) : (
                <Spinner />
            )}
        </div>
    );
};

export default OrderDetail;