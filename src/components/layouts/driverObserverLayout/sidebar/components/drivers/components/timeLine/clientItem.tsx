import { useMemo } from 'react';
import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { CheckIcon, SubsOutilinedIcon } from '@repo/icons';
import { useCreatePath } from '@repo/map-core';
import {
  useMapDriverObserverContext,
  useModalRef,
  useNotifyRef,
} from '../../../../../../../../utils/hooks/map/useContextRef';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store/hooks';
import {
  changeOneVisibility,
  selectDriversWatchList,
} from '../../../../../../../../store/slices/driverObserver/driversSlice';
import { formatMoney } from '../../../../../../../../utils/helpers/formatters';
import InvoiceModal from '../../../../../../../../pages/home/components/invoiceModal';

interface IClientItemProps {
  client: IFDeliveryClient;
  index: number;
  deliveryId?: number;
  driverId?: number;
}

const ClientItem = ({ client, index, deliveryId, driverId }: IClientItemProps) => {
  const dispatch = useAppDispatch();
  const watchList = useAppSelector(selectDriversWatchList);
  const { OpenModal } = useModalRef();
  const notify = useNotifyRef();
  const { clientElements, mapRef } = useMapDriverObserverContext();
  const { focusOnMarker } = useCreatePath({ mapRef });

  const invoiceTotal = useMemo(() => {
    return (client.invoicesTotal || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [client.invoicesTotal]);

  const handleClientClick = () => {
    if (driverId && !watchList.includes(driverId)) {
      dispatch(changeOneVisibility(driverId));
    }

    if (!client?.location) {
      notify('El cliente no cuenta con coordenadas válidas', 'WARN');
      return;
    }

    const { latitude, longitude } = client.location;

    const alterPoint: [number, number] | null =
      latitude && longitude ? [Number(latitude), Number(longitude)] : null;

    if (!alterPoint || isNaN(alterPoint[0]) || isNaN(alterPoint[1]) || (alterPoint[0] === 0 && alterPoint[1] === 0)) {
      notify('El cliente no cuenta con coordenadas válidas', 'WARN');
      return;
    }

    focusOnMarker({
      id: 'deliveryClients',
      subId: client.id,
      target: clientElements,
      markerMapRef: 'clientMarkers',
      alt: alterPoint,
    });
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    client?.id
      ? OpenModal({
        Component: InvoiceModal,
        props: { client, deliveryId },
      })
      : notify('No se cuenta con ningún cliente', 'WARN');
  };

  const stopNumber = client.index != null ? client.index : index + 1;

  return (
    <div
      onClick={handleClientClick}
      className="w-full h-[80px] flex items-center justify-between px-2 bg-primary-950/40 hover:bg-primary-900/50 backdrop-blur-md rounded-dx border border-main/10 hover:border-focus-300/40 transition-all duration-150 shadow-xs cursor-pointer group"
    >
      {/* Badge parada */}
      <div className="w-[45px] ml-1 flex flex-col items-center justify-center h-full shrink-0">
        <span className="text-main/50 text-[9px] uppercase font-bold">Parada</span>
        <span className="text-focus-300 text-sm font-bold font-mono">
          #{stopNumber + 1}
        </span>
      </div>

      {/* Icono de estado de entrega con z-20 para sobreponerse a TimeDivider */}
      <div className="min-w-[40px] relative size-[40px] mx-2.5 shadow-sm shadow-black/60 rounded-full z-20 shrink-0 outline-1 outline-focus-300">
        <div
          onClick={handleIconClick}
          className={`rounded-full size-full flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95 ${client.isProcessed
            ? 'bg-success hover:bg-success'
            : 'bg-warning hover:bg-warning'
            }`}
          title={client.isProcessed ? 'Cliente completado (ver facturas/cobranzas)' : 'Cliente pendiente (ver facturas/cobranzas)'}
        >
          {client.isProcessed ? (
            <CheckIcon className="size-5 stroke-variant" />
          ) : (
            <SubsOutilinedIcon className="size-4 stroke-variant" />
          )}
        </div>
      </div>

      {/* Info del cliente */}
      <div className="flex flex-col justify-center min-w-0 flex-1 h-full items-start pr-1">
        <div className="w-full flex items-center justify-between gap-1">
          <span className="text-focus-300 font-mono font-semibold text-xs truncate">
            #{client.clientId || client.id}
          </span>
        </div>

        <p className="text-xs font-semibold text-main truncate w-full group-hover:text-focus-300 transition-colors">
          {client.name}
        </p>

        {/* Totales y bultos */}
        <div className="w-full flex items-center justify-between gap-2 mt-1 pt-1 border-t border-main/5 text-[11px]">
          <span className="text-main/50 font-medium truncate">
            {client.bulks} {client.bulks === 1 ? 'bulto' : 'bultos'}
          </span>
          <span className="font-bold text-focus-300 font-mono shrink-0">
            ${formatMoney(invoiceTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientItem;
