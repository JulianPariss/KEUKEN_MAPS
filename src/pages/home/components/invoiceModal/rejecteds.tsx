import { useEffect, useMemo, useState } from 'react';
import type {
  IFDeliveryClient,
  IFRejected,
} from '@repo/api-contracts/firebase';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectIsRejectedsLoading,
  selectRejectedsByDeliveryAndClient,
  selectReturnReasons,
  selectReturnReasonDescription,
} from '../../../../store/selectors/rejecteds.selector';
import { fetchReturnReasons } from '../../../../store/slices/driverObserver/rejectedsSlice';
import { formatMoney } from '../../../../utils/helpers/formatters';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import { ArrowIcon, CrossIcon } from '@repo/icons';
import moment from 'moment';

interface IProps {
  client: IFDeliveryClient;
  deliveryId?: number;
}

interface IRejectedCardProps {
  rejected: IFRejected;
}

const RejectedCard = ({ rejected }: IRejectedCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const reasonDescription = useAppSelector((state) =>
    selectReturnReasonDescription(state, rejected.reason)
  );

  const formattedDate = rejected.date
    ? moment(rejected.date).format('DD/MM/YYYY HH:mm:ss')
    : '-';

  return (
    <div
      className={`w-full flex flex-col bg-primary-950/40 backdrop-blur-xl border rounded-dx transition-all duration-200 overflow-hidden shadow-xs ${rejected.isAnnulled
        ? 'border-error/30 opacity-75'
        : 'border-main/10 hover:border-focus-300/30'
        }`}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-primary-500/25 hover:bg-primary-500/35 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="size-6 flex items-center justify-center rounded-dx hover:bg-main/15 transition-colors cursor-pointer text-main shrink-0"
            title={isExpanded ? 'Colapsar detalles' : 'Expandir detalles'}
          >
            <ArrowIcon
              className={`size-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-0 text-focus-300' : '-rotate-90 text-main/70'
                }`}
            />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-main/50 text-[10px] uppercase font-bold">
              ID
            </span>
            <span className="text-focus-300 font-mono font-bold text-sm">
              #{rejected.id || '-'}
            </span>
            <span className="text-main/40">·</span>
            <span className="text-main/60 font-medium">{formattedDate}</span>
            <span className="text-main/40">·</span>
          </div>

          <div className="flex items-center gap-1">
            {rejected.isAnnulled && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-dx text-[10px] font-bold bg-error/20 text-error border border-error/30">
                <CrossIcon className="size-3 stroke-error" />
                ANULADO
              </span>
            )}
            {rejected.reason && (
              <p
                className="rounded-dx text-[11px] font-bold text-main/50"
              >
                <span className="text-main/40 mr-1">MR:</span>
                <span className='capitalize text-focus-300'> {reasonDescription.toLowerCase()}</span>
              </p>
            )}
          </div>
        </div>

        {/* Totales */}
        <div className="flex items-center gap-4 text-right ml-auto">
          <div className="flex flex-col items-end">
            <span className="text-main/50 text-[10px] uppercase font-bold">
              Total Rechazado
            </span>
            <span
              className={`font-mono text-base font-bold ${rejected.isAnnulled ? 'line-through text-main/40' : 'text-error'
                }`}
            >
              ${formatMoney(rejected.rejectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 flex flex-col gap-4 border-t border-main/10">

          {rejected.noVisitReason && (
            <div>
              <h4 className="text-main/70 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Motivo de no visita
              </h4>
              <p className="text-xs text-main">{rejected.noVisitReason}</p>
            </div>
          )}

          {/* SECCIÓN: Facturas Imputadas */}
          <div>
            <h4 className="text-main/70 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              Facturas Rechazadas ({(rejected.invoices || []).length})
            </h4>

            {rejected.invoices && rejected.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-main/10 text-main/50 uppercase font-bold text-[10px]">
                      <th className="py-2 px-2.5">Factura</th>
                      <th className="py-2 px-2.5 text-right">Total Factura</th>
                      <th className="py-2 px-2.5 text-right">Monto Rechazado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-main/5">
                    {rejected.invoices.map((inv, iIdx) => (
                      <tr key={inv.invoiceId || iIdx} className="hover:bg-primary-500/10 transition-colors">
                        <td className="py-2.5 px-2.5 font-medium">
                          <div className="flex flex-col gap-1">
                            <div>
                              <span className="text-focus-300 font-mono font-semibold">
                                {inv.description || `Factura #${inv.invoiceId}`}
                              </span>
                              {inv.isTotalRejected && (
                                <span className="ml-2 text-[11px] font-bold text-error">
                                  | Totalmente Rechazada
                                </span>
                              )}
                            </div>

                            {inv.rejectedItems && inv.rejectedItems.length > 0 && (
                              <div className="pl-2 border-l border-main/20 mt-1 flex flex-col gap-1 text-[12px]">
                                {inv.rejectedItems.map((item, itemIdx) => (
                                  <div key={item.id || itemIdx} className="flex justify-between items-center text-main/80 hover:bg-focus-300/10">
                                    <span>{item.quantityRejectedUnits}x {item.description}</span>
                                    <span className="font-mono">${formatMoney(item.amountRejected)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-main/70 align-top">
                          ${formatMoney(inv.amount)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-error align-top">
                          ${formatMoney(inv.rejectedAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-main/50 italic">Sin facturas rechazadas en este comprobante.</p>
            )}
          </div>

          {/* SECCIÓN: Percepciones */}
          {rejected.perceptionsRejected && rejected.perceptionsRejected.length > 0 && (
            <div>
              <h4 className="text-main/70 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Percepciones Rechazadas ({rejected.perceptionsRejected.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {rejected.perceptionsRejected.map((perc, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-2 bg-primary-900/40 border border-main/10 rounded-dx text-xs text-main"
                  >
                    <span className="font-mono font-semibold text-focus-300">
                      {perc.name || perc.id || 'Percepción'}:
                    </span>
                    ${formatMoney(perc.amount || 0)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RejectedsTab = ({ client, deliveryId: propDeliveryId }: IProps) => {
  const dispatch = useAppDispatch();
  const returnReasons = useAppSelector(selectReturnReasons);

  useEffect(() => {
    if (Object.keys(returnReasons).length === 0) {
      dispatch(fetchReturnReasons());
    }
  }, [dispatch, returnReasons]);

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

  const rejecteds = useAppSelector((state) =>
    selectRejectedsByDeliveryAndClient(state, resolvedDeliveryId, targetClientId, fallbackClientId)
  );

  const isLoading = useAppSelector((state) =>
    selectIsRejectedsLoading(state, resolvedDeliveryId, targetClientId, fallbackClientId)
  );

  const totals = useMemo(() => {
    let rejected = 0;

    for (const p of rejecteds) {
      if (!p.isAnnulled) {
        rejected += Number(p.rejectedAmount || 0);
      }
    }

    return {
      rejected,
      count: rejecteds.length,
    };
  }, [rejecteds]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1">
        <Spinner />
        <p className="text-main/70 text-sm mt-3 animate-pulse">
          Consultando devoluciones...
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

  if (!rejecteds || rejecteds.length === 0) {
    return (
      <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-2 flex justify-center items-center h-[280px]">
        <Empty text={`No se registraron devoluciones para el reparto #${resolvedDeliveryId}.`} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden h-[450px] md:h-[350px] pr-1 mt-1">
      <div className="w-full flex items-center justify-between px-3.5 py-2 bg-primary-950/50 backdrop-blur-md border border-main/10 rounded-dx text-xs">
        <div className="flex items-center gap-x-5">
          <span className="text-main/60">
            Devoluciones: <strong className="text-main font-mono font-bold">{totals.count}</strong>
          </span>
          <span className="text-main/60">
            Total Rechazado:{' '}
            <strong className="text-error font-mono font-bold">
              ${formatMoney(totals.rejected)}
            </strong>
          </span>
        </div>

        <div className="text-right text-xs text-main/50 shrink-0">
          Reparto <span className="font-mono text-focus-300 font-bold">#{resolvedDeliveryId}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-3">
        {rejecteds.map((p, idx) => (
          <RejectedCard key={p.id || idx} rejected={p} />
        ))}
      </div>
    </div>
  );
};

export default RejectedsTab;
