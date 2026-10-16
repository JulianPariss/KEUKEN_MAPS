import { useMemo } from 'react';
import moment from 'moment';
import { useMapTime } from '@repo/map-core';
import type { IFDeliverie, IFDeliveryClient } from '@repo/api-contracts/firebase';
import { CartXMarkIcon } from '@repo/icons';
import ClientItem from './clientItem';
import { useAppSelector } from '../../../../../../../../store/hooks';
import DotsLoader from '../../../../../../components/dotsLoader';
import { formatMoney } from '../../../../../../../../utils/helpers/formatters';
import {
  resolveVisitForClient,
  selectVisitByDeliveryClientKey,
} from '../../../../../../../../store/slices/driverObserver/visitsSlice';
import type { IFVisit } from '@repo/api-contracts/firebase';

interface ITimeLineProps {
  delivery: IFDeliverie;
  driverId: number;
}

const TIME_GAP_MINUTES = 5;

const TimeDivider = ({ isActive, isShort = false }: { isActive: boolean; isShort?: boolean }) => (
  <hr
    className={`
      left-[87px] w-[2px] border-0 absolute z-10
      ${isActive ? 'bg-focus-300' : 'bg-main/15'}
      ${isShort ? 'h-[47px] top-[-9px]' : 'h-[60px] top-[-20px]'}
    `}
  />
);

const getClientVisitTime = (
  client: IFDeliveryClient,
  deliveryId: number,
  visitByKey: Record<string, IFVisit>
): string | null => {
  if (client.visitedAt) return client.visitedAt;
  return resolveVisitForClient(visitByKey, deliveryId, client)?.visitTime || null;
};

const TimeLine = ({ delivery, driverId }: ITimeLineProps) => {
  const { currentProgress, startTime } = useMapTime();
  const { isAnimating, driverAnimated } = useAppSelector((state) => state.drivers.animation);
  const { clientIdsByDeliveryId, clientById, loading } = useAppSelector(
    (state) => state.deliveryClients
  );
  const visitByKey = useAppSelector(selectVisitByDeliveryClientKey);

  const animatedMoment = moment(startTime).add(currentProgress, 'seconds');
  const isDriverAnimating = isAnimating && driverAnimated === driverId;

  // Orden cronológico por visitedAt / visitTime (sin hora al final, por index)
  const sortedClients = useMemo(() => {
    const clientIds = clientIdsByDeliveryId[delivery.id] || [];
    const list = clientIds
      .map((id) => clientById[id])
      .filter((c): c is IFDeliveryClient => Boolean(c));

    return list.slice().sort((a, b) => {
      const aTime = getClientVisitTime(a, delivery.id, visitByKey);
      const bTime = getClientVisitTime(b, delivery.id, visitByKey);

      if (aTime && bTime) {
        return new Date(aTime).getTime() - new Date(bTime).getTime();
      }
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;

      if (a.index != null && b.index != null) return a.index - b.index;
      if (a.index != null) return -1;
      if (b.index != null) return 1;
      return 0;
    });
  }, [clientIdsByDeliveryId, clientById, delivery.id, visitByKey]);

  const itsHappened = (visitTime: string | null) => {
    if (!visitTime || !isDriverAnimating) return false;
    return animatedMoment.isAfter(
      moment(visitTime).clone().subtract(TIME_GAP_MINUTES, 'minutes')
    );
  };

  const itsTimed = (visitTime: string | null) => {
    if (!visitTime || !isDriverAnimating) return false;
    const created = moment(visitTime);
    return animatedMoment.isBetween(
      created.clone().subtract(TIME_GAP_MINUTES, 'minutes'),
      created,
      undefined,
      '[]'
    );
  };

  const stats = useMemo(() => {
    let processedCount = 0;
    let totalBulks = 0;
    let totalAmount = 0;

    for (const client of sortedClients) {
      if (client.isProcessed) {
        processedCount++;
      }
      totalBulks += Number(client.bulks || 0);
      const invTotal = (client.invoicesTotal || []).reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0
      );
      totalAmount += invTotal;
    }

    const totalClients = sortedClients.length || Number(delivery.clientsCount || 0);
    const percent =
      totalClients > 0 ? Math.round((processedCount / totalClients) * 100) : 0;

    return {
      totalClients,
      processedCount,
      percent,
      totalBulks: totalBulks || Number(delivery.bulks || 0),
      totalAmount:
        totalAmount ||
        Number(delivery.totalInCash || 0) + Number(delivery.totalInCheckingAccount || 0),
    };
  }, [sortedClients, delivery]);

  return (
    <div className="flex flex-col justify-between min-h-full">
      <div className="h-fit w-full flex flex-col justify-center items-center mt-4 px-4">
        {loading && sortedClients.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-main/60 gap-3">
            <DotsLoader size="md" />
            <p className="text-xs">Cargando paradas del reparto...</p>
          </div>
        )}

        {!loading && sortedClients.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-main/40 gap-3 text-center">
            <CartXMarkIcon className="size-10 stroke-main/30" />
            <p className="text-xs font-medium">
              No se encontraron clientes para el reparto #{delivery.id}
            </p>
          </div>
        )}

        {sortedClients.map((client, index) => {
          const visitTime = getClientVisitTime(client, delivery.id, visitByKey);
          const happened = itsHappened(visitTime);
          const timed = itsTimed(visitTime);
          const isActive = happened || !isDriverAnimating;

          return (
            <div key={client.id || client.clientId || index} className="w-full">
              <ClientItem
                client={client}
                index={index}
                deliveryId={delivery.id}
                driverId={driverId}
                displayTimeOverride={visitTime}
                itsTimed={timed}
                isHighlighted={happened}
                isActive={isActive}
              />
              <div className="w-full flex justify-between">
                <div className="w-full relative h-[20px] z-10">
                  {sortedClients.length - 1 > index ? (
                    <TimeDivider
                      isActive={
                        isDriverAnimating
                          ? happened
                          : Boolean(client.isProcessed)
                      }
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-primary-950/95 backdrop-blur-xl p-3 w-full z-50 flex flex-col gap-2 border-t border-main/10 shadow-up-md">
        <div className="flex justify-between items-center text-xs">
          <span className="text-main/60 font-medium">Progreso de entrega:</span>
          <span className="font-bold text-main">
            <span className="text-focus-300 font-bold">{stats.processedCount}</span> /{' '}
            {stats.totalClients} ({stats.percent}%)
          </span>
        </div>

        <div className="w-full bg-primary-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-focus-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs pt-1 border-t border-main/5">
          <span className="text-main/60 font-medium">
            {stats.totalBulks} {stats.totalBulks === 1 ? 'bulto' : 'bultos'}
          </span>
          <span className="text-focus-300 font-bold font-mono text-sm">
            ${formatMoney(stats.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeLine;
