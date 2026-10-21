import { useEffect, useMemo, useState } from 'react';
import type { IFDeliveryClient, IFForward } from '@repo/api-contracts/firebase';
import { useTheme } from '@repo/ui/theme';
import moment from 'moment';
import { useAppSelector } from '../../../../store/hooks';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import { formatMoney } from '../../../../utils/helpers/formatters';
import { DeliveryBulletPager } from './components/DeliveryBulletPager';

interface IProps {
  client: IFDeliveryClient;
  deliveryIds?: number[];
  deliveryId?: number;
}

interface IForwardsByDelivery {
  deliveryId: number;
  forwards: IFForward[];
}

const ForwardsTab = ({
  client,
  deliveryIds: propDeliveryIds,
  deliveryId: propDeliveryId,
}: IProps) => {
  useTheme();

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

  const forwardsByDeliveryId = useAppSelector(
    (state) => state.forwards?.forwardsByDeliveryId
  );
  const loadingByDeliveryId = useAppSelector(
    (state) => state.forwards?.loadingByDeliveryId
  );

  const groups = useMemo((): IForwardsByDelivery[] => {
    const targetIds = [targetClientId, fallbackClientId]
      .filter((id): id is number => id != null)
      .map(Number);

    return deliveryIds.map((deliveryId) => {
      const list = forwardsByDeliveryId?.[deliveryId] || [];
      const forwards = list.filter((f) => targetIds.includes(Number(f.clientId)));
      return { deliveryId, forwards };
    });
  }, [deliveryIds, forwardsByDeliveryId, targetClientId, fallbackClientId]);

  const activeDeliveryId = currentDeliveryId ?? deliveryIds[0];
  const activeGroup = groups.find((g) => g.deliveryId === activeDeliveryId);
  const forwards = activeGroup?.forwards ?? [];

  const isLoading = deliveryIds.some((dId) => Boolean(loadingByDeliveryId?.[dId]));

  const totalAmount = useMemo(
    () => forwards.reduce((acc, f) => acc + (Number(f.forwardedAmount) || 0), 0),
    [forwards]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1">
        <Spinner />
        <p className="text-main/70 text-sm mt-3 animate-pulse">
          Consultando reprogramaciones...
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
              Reprogramaciones:{' '}
              <strong className="text-main font-mono font-bold">{forwards.length}</strong>
            </span>
            <span className="text-main/60">
              Monto:{' '}
              <strong className="font-mono font-bold text-[#C4B5FD]">
                ${formatMoney(totalAmount)}
              </strong>
            </span>
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

        {forwards.length === 0 ? (
          <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 flex justify-center items-center h-[280px]">
            <Empty
              text={`No hay reprogramaciones para el reparto #${activeDeliveryId}.`}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-1">
            {forwards.map((fwd, idx) => (
              <ForwardCard
                key={fwd.id ?? `${fwd.deliveryId}_${fwd.clientId}_${idx}`}
                forward={fwd}
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

const ForwardCard = ({ forward }: { forward: IFForward }) => {
  const descriptions = forward.invoiceDescription?.filter(Boolean) || [];
  const invoiceIds = forward.invoiceId || [];
  const dateLabel = forward.date
    ? moment(forward.date).format('DD/MM/YYYY HH:mm:ss')
    : null;

  return (
    <div className="w-full flex flex-col gap-2 px-3.5 py-3 bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-dx text-[10px] font-bold text-variant bg-[#7C3AED]">
              Reprogramado
            </span>
            {forward.downloaded && (
              <span className="px-2 py-0.5 rounded-dx text-[10px] font-semibold bg-main/10 text-main/60 border border-main/15">
                Descargado
              </span>
            )}
            {dateLabel && (
              <span className="text-[11px] text-main/50 font-mono">{dateLabel}</span>
            )}
          </div>

          <p className="text-xs text-main/60 mt-0.5">
            Reparto{' '}
            <span className="font-mono text-focus-300 font-bold">#{forward.deliveryId}</span>
            <span className="text-main/30 mx-1.5">·</span>
            Cliente{' '}
            <span className="font-mono text-main/80 font-semibold">#{forward.clientId}</span>
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] uppercase font-bold text-main/50 tracking-wider">
            Monto reprogramado
          </span>
          <span className="text-base font-mono font-bold text-[#C4B5FD]">
            ${formatMoney(forward.forwardedAmount)}
          </span>
        </div>
      </div>

      {(descriptions.length > 0 || invoiceIds.length > 0) && (
        <div className="pt-2 border-t border-main/10">
          <h4 className="text-main/60 text-[10px] uppercase font-bold tracking-wider mb-1.5">
            Facturas ({Math.max(descriptions.length, invoiceIds.length)})
          </h4>
          <ul className="flex flex-col gap-1">
            {(descriptions.length > 0
              ? descriptions
              : invoiceIds.map((id) => `#${id}`)
            ).map((label, i) => (
              <li
                key={`${invoiceIds[i] ?? i}_${label}`}
                className="text-xs font-mono text-focus-300 font-semibold"
              >
                {label}
                {descriptions.length > 0 && invoiceIds[i] != null && (
                  <span className="text-main/40 font-normal ml-1.5">
                    (#{invoiceIds[i]})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {forward.noVisitReason && (
        <div className="pt-2 border-t border-main/10">
          <h4 className="text-main/60 text-[10px] uppercase font-bold tracking-wider mb-1">
            Motivo de no visita
          </h4>
          <p className="text-xs text-main">{forward.noVisitReason}</p>
        </div>
      )}
    </div>
  );
};

export default ForwardsTab;
