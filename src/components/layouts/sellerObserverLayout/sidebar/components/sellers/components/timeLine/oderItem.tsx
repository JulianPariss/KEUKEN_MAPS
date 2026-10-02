import moment from "moment";
import { type ReactNode, useEffect, useRef } from "react";
import { DialogTrigger, Button } from "react-aria-components";
import { CartCheckIcon, CartXMarkIcon, AlertIcon } from '@repo/icons';
import OrderModal from "../../../../../../../../pages/home/components/orderModal";
import { useAppDispatch, useAppSelector } from "../../../../../../../../store/hooks";
import { changeOneVisibility } from "../../../../../../../../store/slices/sellerObserver/sellersSlice";
import { getClientType } from "../../../../../../../../utils/helpers/clientStatus";
import { batteryToIcon, formatMinutes, formatMoney } from "../../../../../../../../utils/helpers/formatters";
import { useMapSellerObserverContext, useModalRef, useNotifyRef } from "../../../../../../../../utils/hooks/map/useContextRef";
import { useCreatePath } from "@repo/map-core";
import type { IOrder } from "../../../../../../../../utils/types/sellerObserver/sellers.types";
import CustomPopover from "../../../../../../../customPopover";
import { type IClient, type TClientStatus } from "../../../../../../../../utils/types/sellerObserver/clients.types";
import { THEME_TOKENS } from "@repo/ui/theme";

interface IOrderItem {
    order: IOrder;
    seller: number;
    side: boolean;
    itsHappened: (order: IOrder) => boolean;
    itsTimed: boolean;
    isActive: boolean;
    client: IClient | null;
}

const OrderItem = (props: IOrderItem) => {
    const { order, seller, side, itsHappened, isActive, itsTimed, client } = props;
    const itemRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useAppDispatch();
    const { watchList } = useAppSelector((state) => state.sellers)
    const { sellerElements, mapRef } = useMapSellerObserverContext();
    const { focusOnMarker } = useCreatePath({ mapRef });
    const { OpenModal } = useModalRef();
    const notify = useNotifyRef();

    const iconsTypes: Record<TClientStatus, { color: string, Icon: ReactNode }> = {
        UNKOWN: {
            Icon: <CartCheckIcon className="size-full stroke-white p-2" />,
            color: THEME_TOKENS.status.info,
        },
        VISITED: {
            Icon: <CartCheckIcon className="size-full stroke-white p-2" />,
            color: THEME_TOKENS.status.success,
        },
        NOVISITED: {
            Icon: <CartXMarkIcon className="size-full stroke-white p-2" />,
            color: THEME_TOKENS.status.error,
        },
        NOSALE: {
            Icon: <CartXMarkIcon className="size-full stroke-white p-2" />,
            color: THEME_TOKENS.status.warning,
        },
        PENDING: {
            Icon: <CartXMarkIcon className="size-full stroke-white p-2" />,
            color: THEME_TOKENS.status.info,
        }
    };

    const hanldeClientClick = () => {
        !watchList.includes(seller) ? dispatch(changeOneVisibility(seller)) : null;

        if (!order?.clientData?.location) {
            notify('El cliente no cuenta con coordenadas válidas', 'WARN');
            return;
        }

        const { latitude, longitude } = order.clientData.location;

        const alterPoint: [number, number] | null = (latitude && longitude) ? [Number(latitude), Number(longitude)] : null;

        focusOnMarker({
            id: seller,
            subId: order.clientData.code,
            target: sellerElements,
            markerMapRef: "sellPointMarkers",
            alt: alterPoint
        });
    };

    const handleIconClick = () => {
        order.uuid ?
            OpenModal({
                Component: OrderModal,
                props: {
                    orders: [order],
                    sellerId: seller,
                    orderId: order.uuid
                }
            })
            : notify('No se cuenta con ninguna orden', 'WARN');
    };

    const clientType = client ? getClientType(client) : 'PENDING';
    const icon = iconsTypes[clientType];
    const BatteryIcon = batteryToIcon(order.battery);
    const hasExcuse: boolean = order.notInRadiusId !== -1 && !!order.notInRadiusReason;

    const isHighlighted = itsHappened(order);

    useEffect(() => {
        if (!isHighlighted) return;
        itemRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [isHighlighted]);

    return (
        <div ref={itemRef}>
            <div className={`
                w-full h-[80px] flex items-center justify-between px-2 bg-primary-950/40 backdrop-blur-md rounded-dx border transition-all duration-150 shadow-xs
                ${side ? 'flex-row-reverse' : 'flex-row'}
                ${isHighlighted ? 'border-focus-300/90 shadow-md shadow-focus-500/20' : 'border-main/10'}
                ${itsTimed ? 'animate-shadow-pulse' : ''} 
                `}
            >
                <div className="w-[45px] ml-1 flex flex-col items-center justify-center h-full">
                    <p className="text-main text-xs font-bold">
                        {order.t_created ? moment(order.t_created).format('HH:mm:ss') : '--:--:--'}
                    </p>
                    <hr className="w-full h-px my-0.5 border-main/15" />
                    <p className="text-main/70 text-xs text-nowrap ml-0.5" title="Tiempo total en el cliente">
                        {formatMinutes(client?.totalMinutes ?? 0)}
                    </p>
                </div>

                <div
                    className="min-w-[40px] relative size-[40px] mx-2.5 shadow-sm shadow-black/60 rounded-full z-20"
                >
                    {hasExcuse && (
                        <DialogTrigger>
                            <Button
                                className="
                                absolute size-5 bg-linear-to-tr cursor-pointer
                                from-focus-500 to-focus-300 top-[60%]
                                left-[50%] rounded-full border
                                border-focus-300 text-variant flex justify-center items-center group shadow-xs
                            ">
                                <AlertIcon className="size-3.5 fill-variant group-hover:animate-pulse" />
                            </Button>

                            <CustomPopover>
                                <h2 className="text-xs italic text-main/70">Relato del vendedor</h2>
                                <p className="text-main text-xs">{order.notInRadiusReason}</p>
                            </CustomPopover>
                        </DialogTrigger>
                    )}
                    <div
                        style={{ backgroundColor: icon.color }}
                        onClick={handleIconClick}
                        className={`
                        rounded-full size-full cursor-pointer outline-1 transition-colors
                        ${(isActive && clientType !== 'PENDING') ? 'outline-focus-300' : 'outline-main/20'}
                        `}>
                        {icon.Icon}
                    </div>
                </div>

                <div className={`w-full flex flex-col justify-center min-w-0 h-full cursor-pointer ${side ? 'items-end' : 'items-start'}`}
                    onClick={hanldeClientClick}
                >
                    <div className="w-full flex justify-between items-center z-10">
                        <span className={`text-focus-300 font-mono font-semibold text-xs before:content-['#'] ${side ? 'text-end' : 'text-start'}`}>
                            {order.clientData.code}
                        </span>
                        <div className="flex items-center mr-1" title={`${order.saving_energy_mode ? 'Modo ahorro de energía' : ''}`}>
                            <p className="text-xs mr-1 text-main/80">{order.battery ?? '-%'}</p>
                            <BatteryIcon className={`size-3.5 ${order.saving_energy_mode ? 'stroke-error' : 'stroke-main'}`} />
                        </div>
                    </div>
                    <hr className="w-[95%] border-main/10 my-0.5" />
                    <p className={`text-xs text-main max-w-full truncate ${side ? 'text-end' : 'text-start'}`}>
                        {order.clientData.name}
                    </p>
                    <p
                        className={`text-xs text-main font-bold max-w-full truncate ${side ? 'text-end' : 'text-start'}`}>
                        {order.total ? <span className="text-focus-300 before:content-['$']">{formatMoney(order.total)}</span> : <span className="text-main/70 font-normal">{order.noSaleReason}</span>}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderItem;
