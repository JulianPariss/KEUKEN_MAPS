import { useEffect, useMemo } from 'react';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { GenericTabs, type ITabItem } from '@repo/custom-components';
import { useTheme } from '@repo/ui/theme';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchInvoicesByPdv,
  selectInvoicesByPdvAndDate,
} from '../../../../store/slices/driverObserver/invoicesSlice';

import { selectRejectedsByDeliveryAndClient } from '../../../../store/selectors/rejecteds.selector';
import { fetchRejectedsByClient } from '../../../../store/slices/driverObserver/rejectedsSlice';
import InvoicePreview from './invoicePreview';
import InvoiceDetail from './invoiceDetail';
import CollectedPaymentsTab from './collectedPayments';
import RejectedsTab from './rejecteds';
import moment from 'moment';
import { selectCollectedPaymentsByDeliveryAndClient } from '../../../../store/selectors/collectedPayments.selector';
import { fetchCollectedPaymentsByDelivery } from '../../../../store/slices/driverObserver/collectedPaymentsSlice';

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

  const { clientIdsByDeliveryId } = useAppSelector((state) => state.deliveryClients);

  // Resolver el ID del reparto actual
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

  // Buscar si ya existen facturas en el slice para este pdv (client.id) y fecha
  const invoices = useAppSelector((state) =>
    selectInvoicesByPdvAndDate(state, pdvId, formattedDate)
  );

  // Buscar cobros asociados al reparto y cliente
  const collectedPayments = useAppSelector((state) =>
    selectCollectedPaymentsByDeliveryAndClient(state, resolvedDeliveryId, targetClientId, fallbackClientId)
  );

  const rejecteds = useAppSelector((state) =>
    selectRejectedsByDeliveryAndClient(state, resolvedDeliveryId, targetClientId, fallbackClientId)
  );
  // Al abrir el modal, si no están en caché las facturas o cobros, disparar la consulta
  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      dispatch(
        fetchInvoicesByPdv({
          pdvId,
          date: formattedDate,
        })
      );
    }
    if (resolvedDeliveryId) {
      dispatch(
        fetchCollectedPaymentsByDelivery({
          deliveryId: resolvedDeliveryId,
        })
      );
      dispatch(
        fetchRejectedsByClient({
          deliveryId: resolvedDeliveryId,
          clientId: targetClientId,
          fallbackClientId,
        })
      );
    } else {
      dispatch(
        fetchRejectedsByClient({
          clientId: targetClientId,
          fallbackClientId,
        })
      );
    }
  }, [pdvId, formattedDate, resolvedDeliveryId, targetClientId, fallbackClientId, dispatch]);


  const invoicesBadge =
    invoices && invoices.length > 0
      ? ` (${invoices.length})`
      : client.invoicesCount > 0
        ? ` (${client.invoicesCount})`
        : '';

  const collectedBadge =
    collectedPayments && collectedPayments.length > 0
      ? ` (${collectedPayments.length})`
      : '';

  const rejectedsBadge =
    rejecteds && rejecteds.length > 0
      ? ` (${rejecteds.length})`
      : '';

  const tabs: ITabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'Datos Generales',
        content: <InvoicePreview client={client} />,
      },
      {
        id: 'invoices',
        label: `Facturas${invoicesBadge}`,
        content: <InvoiceDetail client={client} />,
      },
      {
        id: 'collectedPayments',
        label: `Cobros${collectedBadge}`,
        content: <CollectedPaymentsTab client={client} deliveryId={resolvedDeliveryId} />,
      },
      {
        id: 'rejecteds',
        label: `Devoluciones${rejectedsBadge}`,
        content: <RejectedsTab client={client} deliveryId={resolvedDeliveryId} />,
      },
    ],
    [client, invoicesBadge, collectedBadge, rejectedsBadge, resolvedDeliveryId]
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
