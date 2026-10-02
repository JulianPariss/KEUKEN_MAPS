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
import { tableHeaders, getInvoiceStatusLabel, getInvoiceStatusColor } from './constants';
import InvoiceDetailContent from './InvoiceDetailContent';

export interface IInvoiceTableRowProps {
  invoice: IFInvoice;
}

export const InvoiceTableRow = ({ invoice }: IInvoiceTableRowProps) => {
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
    <>
      <tr className={`group shadow-xs transition-colors rounded-dx ${isExpanded ? 'bg-primary-950/70' : 'bg-primary-950/30'}`}>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10 first:border-l first:rounded-tl-dx last:border-r last:rounded-tr-dx text-center">
          <button
            type="button"
            onClick={handleToggle}
            className="size-6 flex items-center justify-center rounded-dx hover:bg-main/15 transition-colors cursor-pointer mx-auto text-main"
            title={isExpanded ? 'Colapsar detalle' : 'Expandir detalle'}
            aria-expanded={isExpanded}
          >
            <ArrowIcon
              className={`size-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-0 text-focus-300' : '-rotate-90 text-main/70'
                }`}
            />
          </button>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-focus-300 font-mono font-semibold whitespace-nowrap">
            {invoice.description || `#${invoice.id}`}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-main font-mono font-medium whitespace-nowrap">
            #{invoice.deliveryId}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-main truncate" title={invoice.saleCondition}>
            {invoice.saleCondition || '-'}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-main/90 font-mono whitespace-nowrap">
            {invoice.invoiceExpiration || invoice.date || '-'}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <div className="flex items-center gap-1.5 mx-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${getInvoiceStatusColor(invoice.status)}`}></span>
            <p className="text-sm text-main whitespace-nowrap">
              {getInvoiceStatusLabel(invoice.status)}
            </p>
          </div>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-main/90 font-medium font-mono whitespace-nowrap">
            ${formatMoney(invoice.netAmount)}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10">
          <p className="text-sm mx-1.5 text-main font-bold font-mono whitespace-nowrap">
            ${formatMoney(invoice.amount)}
          </p>
        </td>
        <td className="p-2.5 bg-primary-500/25 group-hover:bg-primary-500/35 transition-colors border-y border-main/10 last:border-r last:rounded-r-dx">
          <p className="text-sm mx-1.5 font-bold font-mono whitespace-nowrap text-focus-300">
            ${formatMoney(invoice.balance)}
          </p>
        </td>
      </tr>

      {isExpanded && (
        <tr className="transition-all">
          <td
            colSpan={tableHeaders.length}
            className="p-4 bg-primary-950/70 backdrop-blur-xl border-x border-b border-main/10 rounded-b-dx shadow-inner"
          >
            <div className="flex flex-col gap-1">
              <InvoiceDetailContent isLoading={isDetailLoading} details={details} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default InvoiceTableRow;
