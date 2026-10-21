import { useEffect, useMemo, useState } from 'react';
import type {
  IFCollectedPayment,
  IFDeliveryClient,
} from '@repo/api-contracts/firebase';
import { useAppSelector } from '../../../../store/hooks';

import { formatMoney } from '../../../../utils/helpers/formatters';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import { PaymentCard } from './components/PaymentCard';
import { DeliveryBulletPager } from './components/DeliveryBulletPager';

interface IProps {
  client: IFDeliveryClient;
  deliveryIds?: number[];
  deliveryId?: number;
}

interface IPaymentsByDelivery {
  deliveryId: number;
  payments: IFCollectedPayment[];
}

export const CollectedPaymentsTab = ({
  client,
  deliveryIds: propDeliveryIds,
  deliveryId: propDeliveryId,
}: IProps) => {
  const { clientIdsByDeliveryId } = useAppSelector((state) => state.deliveryClients);
  const targetClientId = client.id;
  const fallbackClientId = client.clientId;

  const deliveryIdsKey = useMemo(() => {
    if (propDeliveryIds && propDeliveryIds.length > 0) {
      return [...propDeliveryIds].sort((a, b) => a - b).join(',');
    }
    if (propDeliveryId != null) return String(propDeliveryId);

    const found: number[] = [];
    for (const [dId, cIds] of Object.entries(clientIdsByDeliveryId)) {
      if (
        cIds.includes(client.id) ||
        (client.clientId && cIds.includes(client.clientId))
      ) {
        found.push(Number(dId));
      }
    }
    return found.sort((a, b) => a - b).join(',');
  }, [propDeliveryIds, propDeliveryId, client.id, client.clientId, clientIdsByDeliveryId]);

  const deliveryIds = useMemo(
    () => (deliveryIdsKey ? deliveryIdsKey.split(',').map(Number) : []),
    [deliveryIdsKey]
  );

  const [currentDeliveryId, setCurrentDeliveryId] = useState<number | null>(null);

  useEffect(() => {
    if (deliveryIds.length === 0) {
      setCurrentDeliveryId(null);
      return;
    }
    setCurrentDeliveryId((prev) =>
      prev != null && deliveryIds.includes(prev) ? prev : deliveryIds[0]
    );
  }, [deliveryIdsKey]); 

  const paymentsByDeliveryId = useAppSelector(
    (state) => state.collectedPayments?.paymentsByDeliveryId
  );
  const loadingByDeliveryId = useAppSelector(
    (state) => state.collectedPayments?.loadingByDeliveryId
  );

  const groups = useMemo((): IPaymentsByDelivery[] => {
    const targetIds = [targetClientId, fallbackClientId]
      .filter((id): id is number => id != null)
      .map(Number);

    return deliveryIds.map((deliveryId) => {
      const list = paymentsByDeliveryId?.[deliveryId] || [];
      const payments = list.filter((p) => targetIds.includes(Number(p.clientId)));
      return { deliveryId, payments };
    });
  }, [deliveryIds, paymentsByDeliveryId, targetClientId, fallbackClientId]);

  const activeDeliveryId = currentDeliveryId ?? deliveryIds[0];
  const activeGroup = groups.find((g) => g.deliveryId === activeDeliveryId);
  const payments = activeGroup?.payments ?? [];

  const isLoading = deliveryIds.some((dId) => Boolean(loadingByDeliveryId?.[dId]));

  const totals = useMemo(() => {
    let collected = 0;
    let toCollect = 0;
    let toCurrentAccount = 0;

    for (const p of payments) {
      if (!p.isAnnulled) {
        collected += Number(p.paymentCollectedAmount || 0);
        toCollect += Number(p.totalToCollect || 0);
        toCurrentAccount += Number(p.amountToCurrentAccount || 0);
      }
    }

    return {
      collected,
      toCollect,
      toCurrentAccount,
      count: payments.length,
    };
  }, [payments]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1">
        <Spinner />
        <p className="text-main/70 text-sm mt-3 animate-pulse">
          Consultando recolección de pagos...
        </p>
      </div>
    );
  }

  if (deliveryIds.length === 0 || activeDeliveryId == null) {
    return (
      <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1 flex justify-center items-center h-[280px]">
        <Empty text="No se pudo identificar el reparto asociado a este cliente." />
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-1">
      <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden h-[450px] md:h-[350px]">
        <div className="w-full flex items-center justify-between px-3.5 py-2 bg-primary-950/50 backdrop-blur-md border border-main/10 rounded-dx text-xs">
          <div className="flex items-center gap-x-5">
            <span className="text-main/60">
              Cobros: <strong className="text-main font-mono font-bold">{totals.count}</strong>
            </span>
            <span className="text-main/60">
              Total Cobrado:{' '}
              <strong className="text-success font-mono font-bold">
                ${formatMoney(totals.collected)}
              </strong>
            </span>
            {totals.toCollect > 0 && (
              <span className="text-main/60 hidden sm:inline">
                A Cobrar:{' '}
                <strong className="text-main font-mono font-semibold">
                  ${formatMoney(totals.toCollect)}
                </strong>
              </span>
            )}
            {totals.toCurrentAccount > 0 && (
              <span className="text-main/60 hidden md:inline">
                A Cta. Cte.:{' '}
                <strong className="text-warning font-mono font-semibold">
                  ${formatMoney(totals.toCurrentAccount)}
                </strong>
              </span>
            )}
          </div>

          <div className="text-right text-xs text-main/50 shrink-0">
            Reparto{' '}
            <span className="font-mono text-focus-300 font-bold">#{activeDeliveryId}</span>
            {deliveryIds.length > 1 && (
              <span className="text-main/40 ml-1.5">
                ({deliveryIds.indexOf(activeDeliveryId) + 1}/{deliveryIds.length})
              </span>
            )}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 flex justify-center items-center h-[280px]">
            <Empty text={`No se registraron cobros para el reparto #${activeDeliveryId}.`} />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-1">
            {payments.map((p, idx) => (
              <PaymentCard
                key={p.id || p.paymentId || `${activeDeliveryId}_${idx}`}
                payment={p}
              />
            ))}
          </div>
        )}
      </div>

      <DeliveryBulletPager
        deliveryIds={deliveryIds}
        currentDeliveryId={activeDeliveryId}
        onChange={setCurrentDeliveryId}
      />
    </div>
  );
};

export default CollectedPaymentsTab;
