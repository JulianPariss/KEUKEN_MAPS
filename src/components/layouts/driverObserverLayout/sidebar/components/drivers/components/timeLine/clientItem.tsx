import { useEffect, useMemo, useRef } from 'react';
import moment from 'moment';
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
import {
  matchesVisitClient,
  resolveVisitForClient,
  selectVisitByDeliveryClientKey,
  selectVisitsByDeliveryId,
} from '../../../../../../../../store/slices/driverObserver/visitsSlice';
import { batteryToIcon, formatMoney } from '../../../../../../../../utils/helpers/formatters';
import InvoiceModal from '../../../../../../../../pages/home/components/invoiceModal';

interface IClientItemProps {
  client: IFDeliveryClient;
  index: number;
  deliveryId?: number;
  driverId?: number;
  displayTimeOverride?: string | null;
  itsTimed?: boolean;
  isHighlighted?: boolean;
  isActive?: boolean;
}

const ClientItem = ({
  client,
  index,
  deliveryId,
  driverId,
  displayTimeOverride,
  itsTimed = false,
  isHighlighted = false,
  isActive = true,
}: IClientItemProps) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const watchList = useAppSelector(selectDriversWatchList);
  const visitByKey = useAppSelector(selectVisitByDeliveryClientKey);
  const visitsByDeliveryId = useAppSelector(selectVisitsByDeliveryId);
  const { OpenModal } = useModalRef();
  const notify = useNotifyRef();
  const { clientElements, mapRef } = useMapDriverObserverContext();
  const { focusOnMarker } = useCreatePath({ mapRef });

  const invoiceTotal = useMemo(() => {
    return (client.invoicesTotal || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [client.invoicesTotal]);

  // Prioridad: visitedAt del cliente (solo se setea si la visita fue in-radius).
  // Fallback: visitTime de /visits. visit.clientId puede ser client.id o client.clientId.
  const clientVisits = useMemo(() => {
    if (deliveryId == null) return [];
    return (visitsByDeliveryId[deliveryId] || []).filter((v) =>
      matchesVisitClient(v.clientId, { id: client.id, clientId: client.clientId })
    );
  }, [deliveryId, client.id, client.clientId, visitsByDeliveryId]);

  const inRadiusVisit = useMemo(
    () => clientVisits.find((v) => v.isInRadius) ?? null,
    [clientVisits]
  );

  const visit = useMemo(() => {
    if (deliveryId == null) return null;
    return resolveVisitForClient(visitByKey, deliveryId, {
      id: client.id,
      clientId: client.clientId,
    });
  }, [deliveryId, client.id, client.clientId, visitByKey]);

  const displayTime =
    displayTimeOverride !== undefined
      ? displayTimeOverride
      : client.visitedAt || visit?.visitTime || null;
  const isInRadius = client.visitedAt
    ? true
    : visit != null
      ? Boolean(visit.isInRadius)
      : null;

  const metadataVisit = client.visitedAt ? inRadiusVisit : visit;
  const battery = metadataVisit?.metadata?.battery;
  const savingEnergyMode = Boolean(metadataVisit?.metadata?.savingEnergyMode);
  const BatteryIcon = batteryToIcon(battery);
  const radiusTooltip =
    isInRadius === true
      ? 'Visita dentro del radio'
      : isInRadius === false
        ? 'Visita fuera del radio'
        : null;
  const timeLabel = displayTime ? moment(displayTime).format('HH:mm:ss') : '--:--:--';
  const timeClassName = `text-xs font-bold ${isInRadius === false ? 'text-warning' : 'text-main'}`;

  useEffect(() => {
    if (!isHighlighted) return;
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [isHighlighted]);

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
    <div ref={itemRef}>
    <div
      onClick={handleClientClick}
      className={`
        w-full h-[80px] flex items-center justify-between px-2 bg-primary-950/40 hover:bg-primary-900/50
        backdrop-blur-md rounded-dx border transition-all duration-150 shadow-xs cursor-pointer group
        ${isHighlighted ? 'border-focus-300/90 shadow-md shadow-focus-500/20' : 'border-main/10 hover:border-focus-300/40'}
        ${itsTimed ? 'animate-shadow-pulse' : ''}
        ${!isActive ? 'opacity-70' : ''}
      `}
    >
      {/* Hora: visitedAt (in-radius) o visitTime de /visits; # parada */}
      <div className="w-[45px] ml-1 flex flex-col items-center justify-center h-full shrink-0">
        <div className="relative group/time">
          <p className={timeClassName}>{timeLabel}</p>
          {radiusTooltip ? (
            <span
              role="tooltip"
              className="
                pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] z-[100]
                whitespace-nowrap rounded-dx border border-main/10 bg-primary-950/95 px-2 py-1
                text-[10px] font-medium text-main shadow-lg
                opacity-0 transition-opacity group-hover/time:opacity-100
              "
            >
              {radiusTooltip}
            </span>
          ) : null}
        </div>
        <hr className="w-full h-px my-0.5 border-main/15" />
        <span className="text-main/70 text-[9px] uppercase font-bold">
          #{stopNumber + 1}
        </span>
      </div>

      {/* Icono de estado de entrega con z-20 para sobreponerse a TimeDivider */}
      <div
        className={`min-w-[40px] relative size-[40px] mx-2.5 shadow-sm shadow-black/60 rounded-full z-20 shrink-0 outline-1 ${
          isActive ? 'outline-focus-300' : 'outline-main/20'
        }`}
      >
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
          <div
            className="flex items-center mr-1 shrink-0"
            title={savingEnergyMode ? 'Modo ahorro de energía' : undefined}
          >
            <p className="text-xs mr-1 text-main/80">{battery || '-%'}</p>
            <BatteryIcon className={`size-3.5 ${savingEnergyMode ? 'stroke-error' : 'stroke-main'}`} />
          </div>
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
    </div>
  );
};

export default ClientItem;
