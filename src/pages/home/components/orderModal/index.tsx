import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../../store/hooks";
import type { IOrder, ISeller } from "../../../../utils/types/sellerObserver/sellers.types";
import OrderPreview from "./orderPreview";
import OrderDetail from "./orderDetail";
import { calculateDistance, formatDistance } from "@repo/map-core";
import { GenericTabs, type ITabItem } from '@repo/custom-components';

export interface IProps extends IOrder {
    orderId: string | number;
    sellerId: string | number;
    orders: any[];
    polylines: any[];
}

const BulletDot = (props: any) => {
    const { isActive, changeActive, id } = props;

    return (
        <div
            onClick={() => changeActive(id)}
            className={`rounded-full mx-1.5 cursor-pointer size-2.5 transition-all ${isActive ? 'bg-focus-300 ring-2 ring-focus-100/40 scale-125' : 'bg-primary-500/25 border border-main/10 hover:bg-primary-500/50'}`}
        />
    );
};

const OrderModal = (props: IProps) => {
    const { orders, orderId, polylines } = props;
    const [currentOrder, setCurrentOrder] = useState<number | string>(orderId);
    const [seller, setSeller] = useState<ISeller | null>();

    const { sellers } = useAppSelector((state) => state.sellers);

    const getOrder = () => {
        return orders.find((order) => order.uuid === currentOrder);
    };

    const getDistance = () => {
        const polyline = polylines ? polylines.find((poly) => poly.id === currentOrder) : null;
        if (!polyline || !polyline.route?.[0] || !polyline.route?.[1]) return 'Desconocido';

        const distanceMeters = calculateDistance(
            [polyline.route[0][0], polyline.route[0][1]],
            [polyline.route[1][0], polyline.route[1][1]]
        );
        return formatDistance(distanceMeters);
    };

    const tabs: ITabItem[] = useMemo(
        () => [
            {
                id: 'general',
                label: 'Datos Generales',
                content: <OrderPreview order={getOrder()} distance={getDistance()} />,
            },
            {
                id: 'details',
                label: 'Detalles del Pedido',
                content: <OrderDetail order_id={getOrder().uuid} />,
                disabled: getOrder().noSaleReasonId !== -1,
            }
        ],
        [currentOrder, orders, polylines]
    );

    useEffect(() => {
        setSeller(sellers ? sellers.find((s) => s.seller === props.sellerId) : null);
    }, [sellers]);

    return (
        <div className="w-[94vw] lg:w-[1020px] xl:w-[1140px] 2xl:w-[1200px] max-w-[96vw] mt-2 flex flex-col justify-center">
            {/* Header Card */}
            <div className="w-full flex justify-between mb-2 flex-col bg-primary-950/40 backdrop-blur-xl border border-main/10 p-4 rounded-dx shadow-xs">
                <div className="flex justify-between items-start gap-1">
                    <div>
                        <h2 className="text-main text-lg font-bold flex items-center gap-x-2">
                            {getOrder().clientData.name}{' '}
                            <span className="text-focus-300 text-sm font-semibold font-mono before:content-['#']">
                                {getOrder().clientData.code}
                            </span>
                        </h2>
                        <h3 className="text-main/70 text-sm mt-0.5">
                            Vendedor a cargo:{' '}
                            <span className="text-main font-medium">{seller?.sellerName ?? 'Desconocido'}</span>{' '}
                            <span className="text-focus-300 text-xs font-mono font-semibold before:content-['#']">
                                {props.sellerId}
                            </span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <GenericTabs
                key={currentOrder} // Force re-render tabs content properly if order changes
                tabs={tabs}
                defaultTabId="general"
                containerClassName="flex flex-col w-full"
                headerClassName="flex bg-primary-500/75 p-1 rounded-dx border border-primary-500/10 w-full gap-x-1.5 mb-1"
                contentClassName="w-full flex flex-col"
            />

            {orders.length > 1 && (
                <div className="flex justify-center items-center mt-5 bg-primary-950/20 backdrop-blur-md p-2 rounded-full mx-auto border border-main/5">
                    {orders.map((order, index) => (
                        <BulletDot key={index} id={order.uuid} isActive={currentOrder === order.uuid} changeActive={setCurrentOrder} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderModal;