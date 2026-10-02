import type { IFInvoiceDetail } from '@repo/api-contracts/firebase';
import Spinner from '../../../../../components/spinner';
import { formatMoney } from '../../../../../utils/helpers/formatters';

export interface IInvoiceDetailContentProps {
  isLoading: boolean;
  details: IFInvoiceDetail[] | undefined;
}

export const InvoiceDetailContent = ({ isLoading, details }: IInvoiceDetailContentProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 text-main/70 text-xs">
        <Spinner />
      </div>
    );
  }

  if (!details || details.length === 0) {
    return (
      <div className="flex items-center justify-center p-3 text-main/60 text-xs font-medium bg-primary-900/30 rounded-dx border border-main/10 border-dashed">
        Sin información
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-main/10 text-main/50 uppercase font-bold text-[10px]">
            <th className="py-2 px-2.5">
              Producto
            </th>
            <th className="py-2 px-2.5 text-center">
              Cantidad
            </th>
            <th className="py-2 px-2.5 text-right">
              P. Unitario
            </th>
            <th className="py-2 px-2.5 text-right">
              Subtotal
            </th>
            <th className="py-2 px-2.5 text-right">
              IVA
            </th>
            <th className="py-2 px-2.5 text-right">
              Total
            </th>
            <th className="py-2 px-2.5 text-center">
              Bonif / Desc
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-main/5">
          {details.map((detail, index) => (
            <tr
              key={detail.id || index}
              className="hover:bg-primary-500/10 transition-colors"
            >
              <td className="py-2.5 px-2.5 font-medium">
                <div className="flex items-center gap-1.5 min-w-[160px]">
                  <span className="text-main font-semibold truncate" title={detail.description}>
                    {detail.description || 'Sin descripción'}
                  </span>
                  {detail.productId ? (
                    <span className="text-focus-300 text-[10px] font-mono shrink-0 font-medium">
                      #{detail.productId}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="py-2.5 px-2.5 text-center font-mono text-main whitespace-nowrap">
                {detail.quantity} {detail.uxB ? <span className="text-main/50 text-[10px]">(UxB: {detail.uxB})</span> : ''}
              </td>
              <td className="py-2.5 px-2.5 text-right font-mono text-main/70 whitespace-nowrap align-top">
                ${formatMoney(detail.unitPrice)}
              </td>
              <td className="py-2.5 px-2.5 text-right font-mono text-main/70 whitespace-nowrap align-top">
                ${formatMoney(detail.totalPrice)}
              </td>
              <td className="py-2.5 px-2.5 text-right font-mono text-main/70 whitespace-nowrap align-top">
                <span className="text-main/50 text-[10px] mr-1">({detail.iva}%)</span>
                ${formatMoney(detail.totalPriceWithIva - detail.totalPrice)}
              </td>
              <td className="py-2.5 px-2.5 text-right font-mono font-bold text-focus-300 whitespace-nowrap align-top">
                ${formatMoney(detail.totalPriceWithIva)}
              </td>
              <td className="py-2.5 px-2.5 text-center font-mono text-main/80 whitespace-nowrap align-top">
                {detail.discount ? `${detail.discount}%` : '-'} {detail.bonifQuantity ? `(${detail.bonifQuantity} bonif)` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceDetailContent;
