import { useMemo } from 'react';
import type {
  IFDeliveryClient
} from '@repo/api-contracts/firebase';
import { useAppSelector } from '../../../../store/hooks';

import { formatMoney } from '../../../../utils/helpers/formatters';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import { PaymentCard } from './components/PaymentCard';
import { selectCollectedPaymentsByDeliveryAndClient, selectIsCollectedPaymentsLoading } from '../../../../store/selectors/collectedPayments.selector';

interface IProps {
  client: IFDeliveryClient;
  deliveryId?: number;
}

export const CollectedPaymentsTab = ({ client, deliveryId: propDeliveryId }: IProps) => {
  // 1. Resolver el deliveryId: de props o por búsqueda en el slice deliveryClients
  const { clientIdsByDeliveryId } = useAppSelector((state) => state.deliveryClients);
  const targetClientId = client.id;
  const fallbackClientId = client.clientId;

  const resolvedDeliveryId = useMemo(() => {
    if (propDeliveryId) return propDeliveryId;
    for (const [dId, cIds] of Object.entries(clientIdsByDeliveryId)) {
      if (
        cIds.includes(client.id) ||
        (client.clientId && cIds.includes(client.clientId))
      ) {
        return Number(dId);
      }
    }
    return undefined;
  }, [propDeliveryId, client.id, client.clientId, clientIdsByDeliveryId]);

  const payments = useAppSelector((state) =>
    selectCollectedPaymentsByDeliveryAndClient(state, resolvedDeliveryId, targetClientId, fallbackClientId)
  );

  const isLoading = useAppSelector((state) =>
    selectIsCollectedPaymentsLoading(state, resolvedDeliveryId)
  );

  // Totales consolidados de la consulta
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

  if (!resolvedDeliveryId) {
    return (
      <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1 flex justify-center items-center h-[280px]">
        <Empty text="No se pudo identificar el reparto asociado a este cliente." />
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 flex justify-center items-center h-[280px]">
        <Empty text={`No se registraron cobros para el reparto #${resolvedDeliveryId}.`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden h-[450px] md:h-[350px] mt-1">
      {/* Barra de métricas compacta en una sola row */}
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
          Reparto <span className="font-mono text-focus-300 font-bold">#{resolvedDeliveryId}</span>
        </div>
      </div>

      {/* Listado de tarjetas de cobros */}
      <div className="flex flex-col gap-2 pb-3">
        {payments.map((p, idx) => (
          <PaymentCard key={p.id || p.paymentId || idx} payment={p} />
        ))}
      </div>
    </div>
  );
};

export default CollectedPaymentsTab;
