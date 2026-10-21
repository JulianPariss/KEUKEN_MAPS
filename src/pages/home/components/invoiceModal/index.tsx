import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { GenericTabs, type ITabItem } from '@repo/custom-components';
import { useTheme } from '@repo/ui/theme';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchInvoicesByPdv,
  selectInvoicesByPdvAndDate,
} from '../../../../store/slices/driverObserver/invoicesSlice';
import { selectDeliveryIdsForClient } from '../../../../store/slices/driverObserver/clientsSlice';

import { selectRejectedsByDeliveryAndClient } from '../../../../store/selectors/rejecteds.selector';
import { fetchRejectedsByClient } from '../../../../store/slices/driverObserver/rejectedsSlice';
import InvoicePreview from './invoicePreview';
import InvoiceDetail from './invoiceDetail';
import CollectedPaymentsTab from './collectedPayments';
import RejectedsTab from './rejecteds';
import ForwardsTab from './forwards';
import moment from 'moment';
import { selectCollectedPaymentsByDeliveryAndClient } from '../../../../store/selectors/collectedPayments.selector';
import { fetchCollectedPaymentsByDelivery } from '../../../../store/slices/driverObserver/collectedPaymentsSlice';
import {
  fetchForwardsByClient,
  fetchForwardsByDelivery,
} from '../../../../store/slices/driverObserver/forwardsSlice';

export interface IInvoiceModalProps {
  client: IFDeliveryClient;
  deliveryId?: number;
}

const InvoiceModal = ({ client, deliveryId: propDeliveryId }: IInvoiceModalProps) => {
  useTheme();
  const dispatch = useAppDispatch();
  const pdvId = client.id;
  const targetClientId = client.id;
  const fallbackClientId = client.clientId;
  const locality = [client.city, client.partido, client.province].filter(Boolean).join(' · ');

  const { date } = useAppSelector((state) => state.sidebar);
  const formattedDate = moment(date).format('YYYY-MM-DD');

  const invoices = useAppSelector((state) =>
    selectInvoicesByPdvAndDate(state, pdvId, formattedDate)
  );

  const deliveryIdsFromIndex = useAppSelector(
    (state) => selectDeliveryIdsForClient(state, targetClientId, fallbackClientId),
    shallowEqual
  );

  /** Union estable: índice + facturas PDV+fecha + prop. */
  const deliveryIds = useMemo(() => {
    const set = new Set<number>();
    for (const id of deliveryIdsFromIndex) {
      if (Number.isFinite(id)) set.add(Number(id));
    }
    for (const inv of invoices) {
      const dId = Number(inv.deliveryId);
      if (Number.isFinite(dId) && dId > 0) set.add(dId);
    }
    if (propDeliveryId != null && Number.isFinite(propDeliveryId)) {
      set.add(Number(propDeliveryId));
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [deliveryIdsFromIndex, invoices, propDeliveryId]);

  const deliveryIdsKey = deliveryIds.join(',');

  const collectedCount = useAppSelector((state) => {
    let count = 0;
    for (const dId of deliveryIds) {
      count += selectCollectedPaymentsByDeliveryAndClient(
        state,
        dId,
        targetClientId,
        fallbackClientId
      ).length;
    }
    return count;
  });

  const rejectedsCount = useAppSelector((state) => {
    let count = 0;
    for (const dId of deliveryIds) {
      count += selectRejectedsByDeliveryAndClient(
        state,
        dId,
        targetClientId,
        fallbackClientId
      ).length;
    }
    return count;
  });

  const forwardedCount = useAppSelector((state) => {
    const targetIds = [targetClientId, fallbackClientId]
      .filter((id): id is number => id != null)
      .map(Number);
    let count = 0;
    for (const dId of deliveryIds) {
      const list = state.forwards?.forwardsByDeliveryId?.[dId] || [];
      count += list.filter((f) => targetIds.includes(Number(f.clientId))).length;
    }
    return count;
  });

  useEffect(() => {
    dispatch(
      fetchInvoicesByPdv({
        pdvId,
        date: formattedDate,
      })
    );
  }, [pdvId, formattedDate, dispatch]);

  useEffect(() => {
    if (!deliveryIdsKey) {
      dispatch(
        fetchRejectedsByClient({
          clientId: targetClientId,
          fallbackClientId,
        })
      );
      dispatch(
        fetchForwardsByClient({
          clientId: targetClientId,
          fallbackClientId,
        })
      );
      return;
    }

    const ids = deliveryIdsKey.split(',').map(Number);
    for (const deliveryId of ids) {
      dispatch(fetchCollectedPaymentsByDelivery({ deliveryId }));
      dispatch(fetchForwardsByDelivery({ deliveryId }));
      dispatch(
        fetchRejectedsByClient({
          deliveryId,
          clientId: targetClientId,
          fallbackClientId,
        })
      );
    }
  }, [deliveryIdsKey, targetClientId, fallbackClientId, dispatch]);

  const invoicesBadge =
    invoices.length > 0
      ? ` (${invoices.length})`
      : client.invoicesCount > 0
        ? ` (${client.invoicesCount})`
        : '';

  const collectedBadge = collectedCount > 0 ? ` (${collectedCount})` : '';
  const rejectedsBadge = rejectedsCount > 0 ? ` (${rejectedsCount})` : '';
  const forwardedBadge = forwardedCount > 0 ? ` (${forwardedCount})` : '';

  const tabs: ITabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'Datos Generales',
        content: <InvoicePreview client={client} deliveryIds={deliveryIds} />,
      },
      {
        id: 'invoices',
        label: `Facturas${invoicesBadge}`,
        content: <InvoiceDetail client={client} />,
      },
      {
        id: 'collectedPayments',
        label: `Cobros${collectedBadge}`,
        content: <CollectedPaymentsTab client={client} deliveryIds={deliveryIds} />,
      },
      {
        id: 'rejecteds',
        label: `Devoluciones${rejectedsBadge}`,
        content: <RejectedsTab client={client} deliveryIds={deliveryIds} />,
      },
      {
        id: 'reprogramaciones',
        label: `Reprogramaciones${forwardedBadge}`,
        content: (
          <ForwardsTab client={client} deliveryIds={deliveryIds} />
        ),
      },
    ],
    [client, invoicesBadge, collectedBadge, rejectedsBadge, forwardedBadge, deliveryIds]
  );

  return (
    <div className="w-[94vw] lg:w-[1020px] xl:w-[1140px] 2xl:w-[1200px] max-w-[96vw] mt-2 flex flex-col justify-center">
      {/* Header Card */}
      <div className="w-full flex justify-between mb-2 flex-col bg-primary-950/40 backdrop-blur-xl border border-main/10 p-4 rounded-dx shadow-xs">
        <div className="flex justify-between items-start gap-1">
          <div>
            <h2 className="text-main text-lg font-bold flex items-center gap-x-2">
              {client.name}{' '}
              <span className="text-focus-300 text-sm font-semibold font-mono before:content-['#']">
                {pdvId}
              </span>
            </h2>
            <h3 className="text-main/70 text-sm mt-0.5">
              {client.address}{' '}
              {locality && <span className="text-main/40">· {locality}</span>}
              {client.zone && <span className="text-main/40"> · Zona {client.zone}</span>}
            </h3>
          </div>
          {client.cuit && (
            <div className="text-right shrink-0">
              <span className="text-main/50 text-[10px] uppercase font-bold tracking-wider">
                CUIT
              </span>
              <p className="text-main font-mono text-xs font-semibold">{client.cuit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <GenericTabs
        tabs={tabs}
        defaultTabId="general"
        containerClassName="flex flex-col w-full"
        headerClassName="flex bg-primary-500/75 p-1 rounded-dx border border-primary-500/10 w-full gap-x-1.5 mb-1"
        contentClassName="w-full flex flex-col"
      />
    </div>
  );
};

export default InvoiceModal;
