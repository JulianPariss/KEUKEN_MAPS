import { useState } from 'react';
import type { IFCollectedPayment } from '@repo/api-contracts/firebase';
import { formatMoney } from '../../../../../utils/helpers/formatters';
import { ArrowIcon, CrossIcon, DiagonalArrowRightUpIcon } from '@repo/icons';
import moment from 'moment';
import { PAYMENT_KEY_LABELS } from './constants';

const formatValueKey = (key: string): string => {
  if (PAYMENT_KEY_LABELS[key]) {
    return PAYMENT_KEY_LABELS[key];
  }
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export interface IPaymentCardProps {
  payment: IFCollectedPayment;
}

export const PaymentCard = ({ payment }: IPaymentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formattedDate = payment.date
    ? moment(payment.date).format('DD/MM/YYYY HH:mm:ss')
    : '-';

  return (
    <div
      className={`w-full flex flex-col bg-primary-950/40 backdrop-blur-xl border rounded-dx transition-all duration-200 overflow-hidden shadow-xs ${payment.isAnnulled
        ? 'border-error/30 opacity-75'
        : 'border-main/10 hover:border-focus-300/30'
        }`}
    >
      {/* Header del Cobro */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-primary-500/25 hover:bg-primary-500/35 transition-colors cursor-pointer select-none"
      >
        {/* Recibo, fecha y badges */}
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
              Cobro
            </span>
            <span className="text-main/40">·</span>
            <span className="text-main/60 font-medium">{formattedDate}</span>
          </div>

          {/* Badges de estado */}
          <div className="flex items-center gap-2 ml-1">
            {payment.isAnnulled && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-dx text-[10px] font-bold bg-error/20 text-error border border-error/30">
                <CrossIcon className="size-3 stroke-error" />
                ANULADO
              </span>
            )}

            {payment.isQrPayment && (
              <span className="px-2 py-0.5 rounded-dx text-[10px] font-bold bg-info/20 text-info border border-info/30">
                PAGO QR
              </span>
            )}

            <span className="text-xs text-main">
              {payment.downloaded ? 'Descargado' : 'Pendiente descarga'}
            </span>
          </div>
        </div>

        {/* Totales financieros del cobro */}
        <div className="flex items-center gap-4 text-right ml-auto">
          {payment.amountToCurrentAccount != null && payment.amountToCurrentAccount > 0 && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-main/50 text-[10px] uppercase font-bold tracking-wider">
                A Cta. Cte.
              </span>
              <span className="text-warning font-mono text-xs font-semibold">
                ${formatMoney(payment.amountToCurrentAccount)}
              </span>
            </div>
          )}

          {payment.totalToCollect > 0 && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-main/50 text-[10px] uppercase font-bold tracking-wider">
                A Cobrar
              </span>
              <span className="text-main/70 font-mono text-xs font-medium">
                ${formatMoney(payment.totalToCollect)}
              </span>
            </div>
          )}

          <div className="flex flex-col items-end">
            <span className="text-main/50 text-[10px] uppercase font-bold tracking-wider">
              Total Cobrado
            </span>
            <span
              className={`font-mono text-base font-bold ${payment.isAnnulled ? 'line-through text-main/40' : 'text-success'
                }`}
            >
              ${formatMoney(payment.paymentCollectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 flex flex-col gap-4 border-t border-main/10">
          {/* SECCIÓN 1: Métodos de Pago */}
          <div>
            <h4 className="text-main text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-focus-300"></span>
              Métodos de Pago Utilizados ({(payment.paymentMethods || []).length})
            </h4>

            {payment.paymentMethods && payment.paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {payment.paymentMethods.map((method, idx) => (
                  <div
                    key={method.id || idx}
                    className="flex flex-col bg-primary-900/30 border border-main/10 rounded-dx p-3"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2 pb-2 border-b border-main/10">
                      <div>
                        <p className="text-sm font-bold text-main">
                          {method.description || method.paymentType || 'Método de pago'}
                        </p>
                        {method.bankName && (
                          <p className="text-xs text-main/60">Banco: {method.bankName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-focus-300">
                          {method.currency || 'ARS'}
                        </span>
                        {method.exchangeRate && method.exchangeRate !== 1 && (
                          <p className="text-[10px] text-main/50 font-mono">
                            TC: {method.exchangeRate}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Desglose de valores del método */}
                    {method.values && method.values.length > 0 && (
                      <div className="flex flex-col gap-1.5 text-xs">
                        {method.values.map((val) => (
                          <div
                            key={val.id}
                            className="flex justify-between items-center text-xs py-0.5"
                          >
                            <span className="text-main/50 font-medium">
                              {formatValueKey(val.id)}:
                            </span>
                            <span className="text-main font-mono font-medium truncate max-w-[60%]">
                              {val.id === 'amount' && !isNaN(Number(val.value))
                                ? `$${formatMoney(Number(val.value))}`
                                : val.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comprobante de transferencia adjunto */}
                    {method.transferImageUrl && (
                      <div className="mt-2 pt-2 border-t border-main/10 flex justify-end">
                        <a
                          href={method.transferImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-focus-300 hover:text-focus-200 underline font-medium"
                        >
                          Ver comprobante adjunto
                          <DiagonalArrowRightUpIcon size={14} className="shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-main/50 italic">Sin métodos de pago registrados.</p>
            )}
          </div>

          {/* SECCIÓN 2: Facturas Imputadas */}
          <div>
            <h4 className="text-main text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Facturas Imputadas ({(payment.invoices || []).length})
            </h4>

            {payment.invoices && payment.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-main/10 text-main/50 uppercase font-bold text-[10px]">
                      <th className="py-2 px-2.5">Factura</th>
                      <th className="py-2 px-2.5 text-right">Total Factura</th>
                      <th className="py-2 px-2.5 text-right">Cobrado</th>
                      <th className="py-2 px-2.5 text-right">Saldo Restante</th>
                      {payment.invoices.some((i) => i.amountToCurrentAccount) && (
                        <th className="py-2 px-2.5 text-right">A Cta. Cte.</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-main/5">
                    {payment.invoices.map((inv, iIdx) => (
                      <tr key={inv.invoiceId || iIdx} className="hover:bg-primary-500/10 transition-colors">
                        <td className="py-2.5 px-2.5 font-medium">
                          <div className="flex flex-col">
                            <span className="text-focus-300 font-mono font-semibold">
                              {inv.description || `Factura #${inv.invoiceId}`}
                            </span>
                            {inv.isTotalRejected && (
                              <span className="text-[10px] text-error font-semibold">
                                Totalmente Rechazada
                              </span>
                            )}
                            {inv.rejectedAmount != null && inv.rejectedAmount > 0 && (
                              <span className="text-[10px] text-error">
                                Rechazado: ${formatMoney(inv.rejectedAmount)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-main/70">
                          ${formatMoney(inv.amount)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-success">
                          ${formatMoney(inv.collectedAmount)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-main">
                          ${formatMoney(inv.balance)}
                        </td>
                        {payment.invoices.some((i) => i.amountToCurrentAccount) && (
                          <td className="py-2.5 px-2.5 text-right font-mono text-warning">
                            {inv.amountToCurrentAccount
                              ? `$${formatMoney(inv.amountToCurrentAccount)}`
                              : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-main/50 italic">Sin facturas imputadas en este comprobante.</p>
            )}
          </div>

          {/* SECCIÓN 3: Retenciones si aplican */}
          {payment.retentions && payment.retentions.length > 0 && (
            <div>
              <h4 className="text-main/70 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Retenciones ({payment.retentions.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {payment.retentions.map((ret, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-2 bg-primary-900/40 border border-main/10 rounded-dx text-xs text-main"
                  >
                    <span className="font-mono font-semibold text-focus-300">
                      {ret.type || ret.description || 'Retención'}:
                    </span>{' '}
                    ${formatMoney(ret.amount || 0)}
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
