import { useState } from 'react';
import type { IFInvoice } from '@repo/api-contracts/firebase';
import { ArrowIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  fetchInvoiceDetailById,
  selectInvoiceDetailByInvoiceId,
  selectIsInvoiceDetailLoading,
} from '../../../../../store/slices/driverObserver/invoicesSlice';
import { formatMoney } from '../../../../../utils/helpers/formatters';
import { getInvoiceStatusLabel } from './constants';
import InvoiceDetailContent from './InvoiceDetailContent';

export interface IInvoiceCardProps {
  invoice: IFInvoice;
}

export const InvoiceCard = ({ invoice }: IInvoiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const details = useAppSelector((state) => selectInvoiceDetailByInvoiceId(state, invoice.id));
  const isDetailLoading = useAppSelector((state) => selectIsInvoiceDetailLoading(state, invoice.id));

  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && details === undefined && !isDetailLoading) {
      dispatch(fetchInvoiceDetailById({ invoiceId: invoice.id }));
    }
  };

  return (
    <div className="p-3.5 rounded-dx bg-primary-500/35 backdrop-blur-xl border border-main/15 shadow-xs transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-1 flex-1">
          <button
            type="button"
            onClick={handleToggle}
            className="size-6 shrink-0 mt-0.5 flex items-center justify-center rounded-dx hover:bg-main/15 transition-colors cursor-pointer text-main"
            title={isExpanded ? 'Colapsar detalle' : 'Expandir detalle'}
            aria-expanded={isExpanded}
          >
            <ArrowIcon
              className={`size-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-0 text-focus-300' : '-rotate-90 text-main/70'
                }`}
            />
          </button>
          <div>
            <p className="text-focus-300 text-xs font-bold font-mono uppercase tracking-wider mb-0.5">
              #{invoice.description || invoice.id}
            </p>
            <p className="text-main font-semibold text-sm leading-snug">
              Reparto #{invoice.deliveryId} · {invoice.saleCondition || 'Sin condición'}
            </p>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-main font-bold text-base">${formatMoney(invoice.amount)}</p>
          <p className="text-[10px] text-main/50 uppercase font-medium">Total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 mt-2 border-t border-main/15">
        <div>
          <p className="text-main/60 text-[9px] uppercase font-bold tracking-wider mb-0.5">Neto</p>
          <p className="text-main text-sm font-medium font-mono">${formatMoney(invoice.netAmount)}</p>
        </div>
        <div>
          <p className="text-main/60 text-[9px] uppercase font-bold tracking-wider mb-0.5">Saldo</p>
          <p className="text-sm font-bold font-mono text-focus-300">
            ${formatMoney(invoice.balance)}
          </p>
        </div>
        <div>
          <p className="text-main/60 text-[9px] uppercase font-bold tracking-wider mb-0.5">Estado</p>
          <p className="text-main text-sm font-medium whitespace-nowrap">
            {getInvoiceStatusLabel(invoice.status)}
          </p>
        </div>
        <div>
          <p className="text-main/60 text-[9px] uppercase font-bold tracking-wider mb-0.5">Vencimiento</p>
          <p className="text-main text-xs font-mono">{invoice.invoiceExpiration || invoice.date || '-'}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-main/15">
          <InvoiceDetailContent isLoading={isDetailLoading} details={details} />
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;
