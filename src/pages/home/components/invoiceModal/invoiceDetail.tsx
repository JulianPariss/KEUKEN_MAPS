import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { useTheme } from '@repo/ui/theme';
import {
  fetchInvoicesByPdv,
  selectInvoicesByPdvAndDate,
  selectIsInvoicesLoadingForPdv,
} from '../../../../store/slices/driverObserver/invoicesSlice';
import Empty from '../../../../components/empty';
import Spinner from '../../../../components/spinner';
import moment from 'moment';
import { TableHeader, InvoiceTableRow, InvoiceCard } from './components';

interface IProps {
  client: IFDeliveryClient;
}

const InvoiceDetail = ({ client }: IProps) => {
  useTheme();

  const dispatch = useAppDispatch();
  const { date } = useAppSelector((state) => state.sidebar);
  const formattedDate = moment(date).format('YYYY-MM-DD');
  const pdvId = client.id;

  // 1. Selector reactivo para leer del slice si ya existen facturas cargadas para este pdv (client.id) y fecha
  const invoices = useAppSelector((state) =>
    selectInvoicesByPdvAndDate(state, pdvId, formattedDate)
  );

  const isLoading = useAppSelector((state) =>
    selectIsInvoicesLoadingForPdv(state, pdvId, formattedDate)
  );

  // 2. Comportamiento bajo demanda en la inicialización:
  // Verifica primero la existencia en el slice; si no se encuentra, dispara el fetch
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      return;
    }

    dispatch(
      fetchInvoicesByPdv({
        pdvId,
        date: formattedDate,
      })
    );
  }, [pdvId, formattedDate, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1">
        <Spinner />
        <p className="text-main/70 text-sm mt-3 animate-pulse">Cargando facturas del cliente...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 rounded-dx p-6 mt-1 flex justify-center items-center h-[280px]">
        <Empty text="No se encontraron facturas para este cliente en la fecha seleccionada." />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto overflow-x-hidden h-[450px] md:h-[350px]">
      {/* Desktop Table View */}
      <table className="hidden lg:table w-full border-separate" style={{ borderSpacing: '0 6px' }}>
        <thead>
          <TableHeader />
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <InvoiceTableRow key={inv.id} invoice={inv} />
          ))}
        </tbody>
      </table>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden flex flex-col gap-y-3 pb-4">
        {invoices.map((inv) => (
          <InvoiceCard key={inv.id} invoice={inv} />
        ))}
      </div>
    </div>
  );
};

export default InvoiceDetail;
