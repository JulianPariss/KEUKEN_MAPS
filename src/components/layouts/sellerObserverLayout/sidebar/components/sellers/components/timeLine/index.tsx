import { useMapTime } from "@repo/map-core";
import type { IGps, IOrder } from "../../../../../../../../utils/types/sellerObserver/sellers.types"
import { clientToOrder, type IClient } from "../../../../../../../../utils/types/sellerObserver/clients.types";
import { getClientType } from "../../../../../../../../utils/helpers/clientStatus";
import { useCallback, useEffect, useMemo, useState } from "react";
import GpsItem from "./gpsItem";
import OrderItem from "./oderItem";
import {  } from "../../../../../../../../utils/hooks/map/useContextRef";
import moment from "moment";
import { useAppSelector } from "../../../../../../../../store/hooks";
import { formatMoney } from "../../../../../../../../utils/helpers/formatters";

interface IProps {
    orders: IOrder[]
    clients: IClient[];
    seller: number;
    gps: IGps[];
    clientsBySeller: Record<number, IClient[]>;
}

type ITimeItem = 'ORDER' | 'GPS';

interface ITimeList {
    key: ITimeItem;
    ORDER: IOrder | null;
    GPS: IGps | null;
}

const TimeDivider = ({ isActive, isShort = false }: { isActive: boolean, isShort?: boolean }) => (
    <hr className={`
        left-[87px] w-[2px] border-0 absolute z-10
        ${isActive ? 'bg-focus-300' : 'bg-main/15'}
        ${isShort ? 'h-[47px] top-[-9px]' : 'h-[60px] top-[-20px]'}
    `} />
);

const TimeLine = (props: IProps) => {
    const { currentProgress, startTime } = useMapTime();
    const { isAnimating, sellerAnimated } = useAppSelector((state) => state.sellers.animation);
    const [sortedEvents, setSortedEvents] = useState<ITimeList[] | null>(null);

    const { orders, seller, clients, clientsBySeller, gps } = props;


    const animatedMoment = moment(startTime).add(currentProgress, 'seconds');

    const sortTimeLine = () => {
        const orderEvents: ITimeList[] = orders.map((order) => ({
            key: 'ORDER',
            ORDER: order,
            GPS: null,
        }));

        const gpsEvents: ITimeList[] = gps.map((gp) => ({
            key: 'GPS',
            ORDER: null,
            GPS: gp,
        }));

        const sortedEvents = [...orderEvents, ...gpsEvents].sort((a, b) => {
            const aTime = new Date(a.ORDER?.t_created || a.GPS?.timestamp || 0).getTime();
            const bTime = new Date(b.ORDER?.t_created || b.GPS?.timestamp || 0).getTime();
            return aTime - bTime;
        });

        return sortedEvents;
    };

    const unknowClients: ITimeList[] = clients.filter((cl) => getClientType(cl) === 'PENDING').map((cl): ITimeList => (
        {
            key: 'ORDER',
            ORDER: clientToOrder(cl),
            GPS: null,
        }
    ));

    useEffect(() => {
        if (!gps && !orders) return;
        setSortedEvents([...sortTimeLine(), ...unknowClients]);
    }, [gps, orders]);

    const createdMoment = (order: IOrder) => moment(order.t_created);

    const TIME_GAP = 5;

    const initialAmount = useMemo(() => {
        return orders.reduce((total, order) => {
            const isOver = animatedMoment.isAfter(
                createdMoment(order).clone().subtract(TIME_GAP, 'minutes')
            );

            return total + (isOver ? order.total ?? 0 : 0);
        }, 0);
    }, [animatedMoment]);

    useEffect(() => {
        setCollectedAmount(initialAmount);
    }, [initialAmount]);


    const [collectedAmount, setCollectedAmount] = useState<number>(initialAmount);


    const itsHappened = (order: IOrder) => {
        return animatedMoment.isAfter(
            createdMoment(order).clone().subtract(TIME_GAP, 'minutes'),
        ) && sellerAnimated === seller;
    };

    const itsTimed = (order: IOrder) => {
        return animatedMoment.isBetween(
            createdMoment(order).clone().subtract(TIME_GAP, 'minutes'),
            createdMoment(order),
            undefined,
            '[]' // inclusive
        ) && sellerAnimated === seller;
    };


    const getClientFromOrder = useCallback((order: IOrder): IClient | null => {
        if (!clientsBySeller || !seller || !clientsBySeller[seller]) {
            return null;
        }
        return clientsBySeller[seller].find(
            (cl) => Number(cl.code) === order?.clientData?.code
        ) ?? null;
    }, [clientsBySeller, seller]);

    return (
        <div className="flex flex-col justify-between min-h-full">
            <div className="h-fit w-full flex flex-col justify-center items-center mt-4 px-4">
                {sortedEvents ?
                    sortedEvents.slice().map((timeItem, index) => {
                        if (timeItem.key === 'ORDER' && timeItem.ORDER) {
                            const order = timeItem.ORDER;
                            const client = getClientFromOrder(order);
                            const clType = client ? getClientType(client) : 'PENDING';
                            return (
                                <div key={`${order.uuid}-${index}`} className="w-full">
                                    <OrderItem
                                        order={order}
                                        seller={seller}
                                        side={false}
                                        itsHappened={itsHappened}
                                        itsTimed={itsTimed(order)} 
                                        isActive={itsHappened(order) || !isAnimating}
                                        client={client}
                                    />
                                    <div className="w-full flex justify-between">
                                        <div className="w-full relative h-[20px] z-10">
                                            {sortedEvents.length - 1 > index ?
                                                <TimeDivider isActive={itsHappened(order) || !isAnimating && clType !== 'PENDING'} /> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        } else if (timeItem.key === 'GPS' && timeItem.GPS) {
                            const gps = timeItem.GPS;
                            return (
                                <div key={`${gps.id}-${index}`} className="w-full">
                                    <GpsItem gps={gps} />
                                    <div className="w-full flex justify-between">
                                        <div className="w-full relative h-[20px] z-10">
                                            {sortedEvents.length - 1 > index ? <TimeDivider isActive={true} isShort={true} /> : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    }) : null}
            </div>
            {isAnimating && sellerAnimated === seller && (
                <div className="sticky bottom-0 bg-primary-950/90 backdrop-blur-xl p-2.5 w-full z-50 flex justify-center shadow-up-md border-t border-main/10 rounded-b-dx">
                    <p
                        key={collectedAmount}
                        className="text-focus-300 font-bold text-sm before:content-['$'] animate-stonks">
                        {formatMoney(collectedAmount)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TimeLine;