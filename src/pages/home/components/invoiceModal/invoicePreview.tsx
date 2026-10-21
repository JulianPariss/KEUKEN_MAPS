import { useMemo } from 'react';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { useTheme } from '@repo/ui/theme';
import moment from 'moment';
import { formatMoney } from '../../../../utils/helpers/formatters';
import { useAppSelector } from '../../../../store/hooks';
import { selectInvoicesByPdvAndDate } from '../../../../store/slices/driverObserver/invoicesSlice';
import { deliveryClientKey } from '../../../../store/slices/driverObserver/clientsSlice';

interface ITextBlockProps {
  title: string;
  text: string | number;
  isMono?: boolean;
  valueClassName?: string;
}

const TextBlock = ({ title, text, isMono, valueClassName }: ITextBlockProps) => {
  return (
    <div className="flex flex-col items-start w-full">
      <h2 className="text-main/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">{title}</h2>
      <p
        className={`font-medium text-sm md:text-base ${valueClassName
          ? valueClassName
          : isMono
            ? 'text-focus-300 font-mono font-semibold'
            : 'text-main'
          }`}
      >
        {text}
      </p>
    </div>
  );
};

interface IProps {
  client: IFDeliveryClient;
  deliveryIds?: number[];
}

const InvoicePreview = ({ client, deliveryIds = [] }: IProps) => {
  useTheme();

  const { date } = useAppSelector((state) => state.sidebar);
  const formattedDate = moment(date).format('YYYY-MM-DD');
  const invoices = useAppSelector((state) =>
    selectInvoicesByPdvAndDate(state, client.id, formattedDate)
  );
  const clientByDeliveryKey = useAppSelector(
    (state) => state.deliveryClients.clientByDeliveryKey
  );

  const locality = [client.city, client.partido, client.province].filter(Boolean).join(' · ');

  const formatCurrencyAmounts = (byCurrency: Map<string, number>) =>
    byCurrency.size > 0
      ? Array.from(byCurrency.entries())
          .map(([currency, amount]) => `${currency} ${formatMoney(amount)}`)
          .join(' / ')
      : '$ 0,00';

  const { totalInvoicesStr, invoicesCount, totalBulks, totalBalanceStr, hasDebt } = useMemo(() => {
    const resolveScoped = (dId: number) =>
      clientByDeliveryKey[deliveryClientKey(dId, client.id)] ||
      (client.clientId
        ? clientByDeliveryKey[deliveryClientKey(dId, client.clientId)]
        : null);

    const balanceByCurrency = new Map<string, number>();
    if (deliveryIds.length > 0) {
      for (const dId of deliveryIds) {
        const scoped = resolveScoped(dId);
        for (const b of scoped?.balance || []) {
          const currency = b.currency || '$';
          balanceByCurrency.set(
            currency,
            (balanceByCurrency.get(currency) || 0) + (Number(b.amount) || 0)
          );
        }
      }
    } else {
      for (const b of client.balance || []) {
        const currency = b.currency || '$';
        balanceByCurrency.set(
          currency,
          (balanceByCurrency.get(currency) || 0) + (Number(b.amount) || 0)
        );
      }
    }

    const balanceStr = formatCurrencyAmounts(balanceByCurrency);
    const debt = Array.from(balanceByCurrency.values()).some((amount) => amount > 0);

    if (invoices && invoices.length > 0) {
      const byCurrency = new Map<string, number>();
      let bulksFromInvoices = 0;
      for (const inv of invoices) {
        const currency = inv.currency || '$';
        byCurrency.set(currency, (byCurrency.get(currency) || 0) + (Number(inv.amount) || 0));
        bulksFromInvoices += Number(inv.bulks || 0) || 0;
      }
      return {
        totalInvoicesStr: formatCurrencyAmounts(byCurrency),
        invoicesCount: invoices.length,
        totalBulks: bulksFromInvoices,
        totalBalanceStr: balanceStr,
        hasDebt: debt,
      };
    }

    let bulksFromDocs = 0;
    const invoicesTotalByCurrency = new Map<string, number>();
    let invoicesCountFromDocs = 0;

    if (deliveryIds.length > 0) {
      for (const dId of deliveryIds) {
        const scoped = resolveScoped(dId);
        bulksFromDocs += Number(scoped?.bulks || 0) || 0;
        invoicesCountFromDocs += Number(scoped?.invoicesCount || 0) || 0;
        for (const i of scoped?.invoicesTotal || []) {
          const currency = i.currency || '$';
          invoicesTotalByCurrency.set(
            currency,
            (invoicesTotalByCurrency.get(currency) || 0) + (Number(i.amount) || 0)
          );
        }
      }
    } else {
      bulksFromDocs = Number(client.bulks || 0) || 0;
      invoicesCountFromDocs = Number(client.invoicesCount || 0) || 0;
      for (const i of client.invoicesTotal || []) {
        const currency = i.currency || '$';
        invoicesTotalByCurrency.set(
          currency,
          (invoicesTotalByCurrency.get(currency) || 0) + (Number(i.amount) || 0)
        );
      }
    }

    return {
      totalInvoicesStr: formatCurrencyAmounts(invoicesTotalByCurrency),
      invoicesCount: invoicesCountFromDocs,
      totalBulks: bulksFromDocs,
      totalBalanceStr: balanceStr,
      hasDebt: debt,
    };
  }, [
    invoices,
    client.balance,
    client.bulks,
    client.invoicesCount,
    client.invoicesTotal,
    client.id,
    client.clientId,
    deliveryIds,
    clientByDeliveryKey,
  ]);

  const deliveriesLabel =
    deliveryIds.length > 0
      ? deliveryIds.map((id) => `#${id}`).join(', ')
      : '-';

  return (
    <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 p-5 rounded-dx shadow-xs mt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-x-10">
        {deliveryIds.length > 0 && (
          <>
            <div className="col-span-full">
              <h2 className="text-main/50 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                Repartos del día
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {deliveryIds.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded-dx text-xs font-mono font-bold bg-focus-500/15 text-focus-300 border border-focus-500/20"
                  >
                    #{id}
                  </span>
                ))}
              </div>
              <p className="sr-only">{deliveriesLabel}</p>
            </div>
            <hr className="col-span-full border-0 border-t border-main/10 my-1" />
          </>
        )}

        <TextBlock
          title="Saldo Cuenta Corriente"
          text={totalBalanceStr}
          valueClassName={hasDebt ? 'text-focus-300 font-mono font-semibold' : 'text-success font-mono font-semibold'}
        />
        <TextBlock
          title="Total en Facturas"
          text={totalInvoicesStr}
          valueClassName="text-main font-mono font-semibold"
        />
        <TextBlock
          title="Cantidad de Facturas"
          text={invoicesCount}
          valueClassName="text-main font-semibold"
        />

        <hr className="col-span-full border-0 border-t border-main/10 my-1" />

        <TextBlock title="CUIT" text={client.cuit || '-'} isMono={Boolean(client.cuit)} valueClassName='text-main' />
        <TextBlock title="Teléfono" text={client.phone || '-'} />
        <TextBlock title="Bultos Totales" text={totalBulks} />

        <hr className="col-span-full border-0 border-t border-main/10 my-1" />

        <TextBlock title="Dirección" text={client.address || '-'} />
        <TextBlock title="Localidad / Provincia" text={locality || '-'} />
        <TextBlock title="Zona" text={client.zone || '-'} />

        {client.logisticObs && (
          <>
            <hr className="col-span-full border-0 border-t border-main/10 my-1" />
            <div className="col-span-full">
              <h2 className="text-main/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Observaciones Logísticas
              </h2>
              <p className="text-main font-medium text-sm bg-primary-500/20 p-3 rounded-dx border border-main/10">
                {client.logisticObs}
              </p>
            </div>
          </>
        )}

        {client.openingHours && client.openingHours.length > 0 && (
          <>
            <hr className="col-span-full border-0 border-t border-main/10 my-1" />
            <div className="col-span-full">
              <h2 className="text-main/50 text-[10px] uppercase font-bold tracking-wider mb-2">
                Horarios de Atención
              </h2>
              <div className="flex flex-wrap gap-2">
                {client.openingHours.map((oh, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-x-2 text-xs py-1 px-2.5 rounded-dx bg-primary-500/20 border border-main/10"
                  >
                    <span className="font-bold text-focus-300">{oh.day}:</span>
                    <span className="text-main/80 font-mono">{oh.time || 'Sin horario'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
