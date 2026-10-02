import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { useTheme } from '@repo/ui/theme';
import { formatMoney } from '../../../../utils/helpers/formatters';

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
}

const InvoicePreview = ({ client }: IProps) => {
  useTheme();

  const locality = [client.city, client.partido, client.province].filter(Boolean).join(' · ');

  const totalBalanceStr =
    client.balance && client.balance.length > 0
      ? client.balance.map((b) => `${b.currency || '$'} ${formatMoney(b.amount)}`).join(' / ')
      : '$ 0,00';

  const hasDebt = client.balance && client.balance.some((b) => b.amount > 0);

  const totalInvoicesStr =
    client.invoicesTotal && client.invoicesTotal.length > 0
      ? client.invoicesTotal.map((i) => `${i.currency || '$'} ${formatMoney(i.amount)}`).join(' / ')
      : '$ 0,00';

  return (
    <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 p-5 rounded-dx shadow-xs mt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-x-10">
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
          text={client.invoicesCount || 0}
          valueClassName="text-main font-semibold"
        />

        <hr className="col-span-full border-0 border-t border-main/10 my-1" />

        <TextBlock title="CUIT" text={client.cuit || '-'} isMono={Boolean(client.cuit)} valueClassName='text-main' />
        <TextBlock title="Teléfono" text={client.phone || '-'} />
        <TextBlock title="Bultos Totales" text={client.bulks || 0} />

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
