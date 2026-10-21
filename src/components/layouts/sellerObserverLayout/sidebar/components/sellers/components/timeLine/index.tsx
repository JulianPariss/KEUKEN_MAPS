import { useMapTime } from "@repo/map-core";
import type { IGps, IOrder } from "../../../../../../../../utils/types/sellerObserver/sellers.types"
import { clientToOrder, type IClient } from "../../../../../../../../utils/types/sellerObserver/clients.types";
import { getClientType, shouldListClientInTimeline } from "../../../../../../../../utils/helpers/clientStatus";
import { useCallback, useEffect, useMemo, useState } from "react";
import GpsItem from "./gpsItem";
import OrderItem from "./oderItem";
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

const DaySeparator = ({ dateLabel }: { dateLabel: string }) => (
    <div className="w-full flex items-center gap-2.5 py-1.5 px-1 relative z-20">
        <div className="flex-1 h-px bg-main/20" />
        <span className="text-[10px] font-semibold tracking-wide text-focus-300 uppercase whitespace-nowrap">
            {dateLabel}
        </span>
        <div className="flex-1 h-px bg-main/20" />
    </div>
);

const TimeLine = (props: IProps) => {
    const { currentProgress, startTime } = useMapTime();
    const { isAnimating, sellerAnimated } = useAppSelector((state) => state.sellers.animation);
    const [sortedEvents, setSortedEvents] = useState<ITimeList[] | null>(null);

    const { orders, seller, clients, clientsBySeller, gps } = props;


    const animatedMoment = moment(startTime).add(currentProgress, 'seconds');

    const getEventTime = (item: ITimeList) => {
        const raw = item.ORDER?.t_created || item.GPS?.timestamp || '';
        if (!raw) return Number.POSITIVE_INFINITY;
        const time = new Date(raw).getTime();
        return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
    };

    const getEventDayKey = (item: ITimeList) => {
        const raw = item.ORDER?.t_created || item.GPS?.timestamp || '';
        if (!raw) return null;
        const day = moment(raw);
        return day.isValid() ? day.format('YYYY-MM-DD') : null;
    };

    const getDaySeparatorLabel = (item: ITimeList) => {
        const raw = item.ORDER?.t_created || item.GPS?.timestamp || '';
        if (!raw) return null;
        const day = moment(raw);
        return day.isValid() ? day.format('DD/MM/YYYY') : null;
    };

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

        const clientsWithoutOrder: ITimeList[] = clients
            .filter(shouldListClientInTimeline)
            .map((cl): ITimeList => ({
                key: 'ORDER',
                ORDER: clientToOrder(cl),
                GPS: null,
            }));

        return [...orderEvents, ...gpsEvents, ...clientsWithoutOrder].sort(
            (a, b) => getEventTime(a) - getEventTime(b)
        );
    };

    useEffect(() => {
        if (!gps && !orders) return;
        setSortedEvents(sortTimeLine());
    }, [gps, orders, clients]);

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
            (cl) => Number(cl.code) === Number(order?.clientData?.code)
        ) ?? null;
    }, [clientsBySeller, seller]);

    return (
        <div className="flex flex-col justify-between min-h-full">
            <div className="h-fit w-full flex flex-col justify-center items-center mt-4 px-4">
                {sortedEvents ?
                    sortedEvents.slice().map((timeItem, index) => {
                        const prevItem = index > 0 ? sortedEvents[index - 1] : null;
                        const nextItem = index < sortedEvents.length - 1 ? sortedEvents[index + 1] : null;
                        const currentDay = getEventDayKey(timeItem);
                        const previousDay = prevItem ? getEventDayKey(prevItem) : null;
                        const nextDay = nextItem ? getEventDayKey(nextItem) : null;
                        const dayLabel = getDaySeparatorLabel(timeItem);
                        const showDaySeparator = Boolean(
                            dayLabel && currentDay && previousDay && currentDay !== previousDay
                        );
                        const dayChangesAfter = Boolean(
                            currentDay && nextDay && currentDay !== nextDay
                        );
                        const showTimeDivider = index < sortedEvents.length - 1 && !dayChangesAfter;

                        if (timeItem.key === 'ORDER' && timeItem.ORDER) {
                            const order = timeItem.ORDER;
                            const client = getClientFromOrder(order);
                            const clType = client ? getClientType(client) : 'PENDING';
                            return (
                                <div key={`${order.uuid || order.clientData?.code || 'order'}-${index}`} className="w-full">
                                    {showDaySeparator && dayLabel ? <DaySeparator dateLabel={dayLabel} /> : null}
                                    <OrderItem
                                        order={order}
                                        seller={seller}
                                        side={false}
                                        itsHappened={itsHappened}
                                        itsTimed={itsTimed(order)} 
                                        isActive={itsHappened(order) || !isAnimating}
                                        client={client}
                                    />
                                    {showTimeDivider ? (
                                        <div className="w-full flex justify-between">
                                            <div className="w-full relative h-[20px] z-10">
                                                <TimeDivider isActive={itsHappened(order) || !isAnimating && clType !== 'PENDING'} />
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        } else if (timeItem.key === 'GPS' && timeItem.GPS) {
                            const gps = timeItem.GPS;
                            return (
                                <div key={`${gps.id}-${index}`} className="w-full">
                                    {showDaySeparator && dayLabel ? <DaySeparator dateLabel={dayLabel} /> : null}
                                    <GpsItem gps={gps} />
                                    {showTimeDivider ? (
                                        <div className="w-full flex justify-between">
                                            <div className="w-full relative h-[20px] z-10">
                                                <TimeDivider isActive={true} isShort={true} />
                                            </div>
                                        </div>
                                    ) : null}
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