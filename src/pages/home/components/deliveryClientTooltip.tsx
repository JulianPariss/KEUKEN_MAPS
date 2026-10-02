import type { IFDeliveryClient } from '@repo/api-contracts/firebase';
import { useTheme } from '@repo/ui/theme';
import { formatMoney } from '../../../utils/helpers/formatters';
import { store } from '../../../store';
import { evaluatePdvStatus } from '../../../store/slices/driverObserver/invoicesSlice';

interface IProps {
  client: IFDeliveryClient;
}

interface IDayConfig {
  key: string;
  label: string;
  fullName: string;
  prefix: string;
}

const DAYS_OF_WEEK: IDayConfig[] = [
  { key: 'lunes', label: 'Lu', fullName: 'Lunes', prefix: 'lun' },
  { key: 'martes', label: 'Ma', fullName: 'Martes', prefix: 'mar' },
  { key: 'miercoles', label: 'Mi', fullName: 'Miércoles', prefix: 'mie' },
  { key: 'jueves', label: 'Ju', fullName: 'Jueves', prefix: 'jue' },
  { key: 'viernes', label: 'Vi', fullName: 'Viernes', prefix: 'vie' },
  { key: 'sabado', label: 'Sa', fullName: 'Sábado', prefix: 'sab' },
  { key: 'domingo', label: 'Do', fullName: 'Domingo', prefix: 'dom' },
];

const normalizeDay = (day: string) => {
  return (day || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const isValidTime = (time: string | undefined): boolean => {
  if (!time) return false;
  const trimmed = time.trim();
  if (!trimmed || trimmed === '-' || trimmed === 'a' || trimmed === 'a y a') return false;
  return /\d/.test(trimmed) || (trimmed.length > 3 && !/^[\s\-ya]+$/i.test(trimmed));
};

const DeliveryClientTooltip = ({ client }: IProps) => {
  useTheme();

  const clientId = client.id;
  const locality = [client.city, client.partido, client.province].filter(Boolean).join(' · ');

  const state = store?.getState?.();
  const date = state?.sidebar?.date;
  const pdvStatus = date
    ? evaluatePdvStatus(client.id, date, state) ??
      (client.clientId && client.clientId !== client.id
        ? evaluatePdvStatus(client.clientId, date, state)
        : null)
    : null;

  // Opening Hours parsing
  const isAllDaysArray = (client.openingHours?.length ?? 0) >= 7;
  const parsedDays = DAYS_OF_WEEK.map((dayConfig) => {
    const match = client.openingHours?.find((oh) => {
      const norm = normalizeDay(oh.day);
      return norm.startsWith(dayConfig.prefix);
    });

    if (!match) {
      return { ...dayConfig, hasVisit: false, time: '' };
    }

    const hasTime = isValidTime(match.time);
    const hasVisit = isAllDaysArray ? hasTime : (hasTime || Boolean(match.day));

    return {
      ...dayConfig,
      hasVisit,
      time: hasTime ? match.time.trim() : '',
    };
  });

  const activeDays = parsedDays.filter((d) => d.hasVisit);
  const activeSchedules = activeDays.map((d) => d.time).filter(Boolean);
  const uniqueSchedules = Array.from(new Set(activeSchedules));
  const commonSchedule = uniqueSchedules.length === 1 ? uniqueSchedules[0] : null;

  // Invoices & Financials
  const totalInvoicesAmount = client.invoicesTotal?.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  ) ?? 0;

  const hasInvoices = (client.invoicesCount > 0) || totalInvoicesAmount > 0;

  const isVisited = Boolean(client.isVisited);
  const isDelivered = Boolean(client.isDelivered);

  let deliveryStatusClass = isDelivered
    ? 'bg-status-success'
    : isVisited
      ? 'bg-status-warning'
      : 'bg-status-error';

  if (pdvStatus === 'PARTIALLYDELIVERED') {
    deliveryStatusClass = 'bg-status-warning';
  } else if (pdvStatus === 'PENDING') {
    deliveryStatusClass = 'bg-status-info';
  } else if (pdvStatus === 'DELIVERED') {
    deliveryStatusClass = 'bg-status-success';
  } else if (pdvStatus === 'REJECTED') {
    deliveryStatusClass = 'bg-status-error';
  }

  return (
    <div className="flex flex-col min-w-[300px] max-w-[350px] text-main font-sans">
      {/* Header: Name and ID */}
      <div className="flex justify-between items-start gap-2 mb-1.5 pb-1.5 border-b border-main/10">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-dx text-[10px] font-mono font-bold bg-focus-500/15 text-focus-300 border border-focus-500/20 shrink-0">
              #{clientId}
            </span>
            {client.zone && (
              <span
                className="px-1.5 py-0.5 rounded-dx text-[10px] font-medium bg-main/5 text-main/70 border border-main/10 shrink-0 truncate max-w-[120px]"
                title={`Zona: ${client.zone}`}
              >
                {client.zone}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-main truncate mt-1" title={client.name}>
            {client.name || `Cliente #${clientId}`}
          </p>
        </div>

        <div className="flex flex-col items-end text-[10px] font-mono text-main/50 shrink-0">
          {client.cuit && <span>CUIT: {client.cuit}</span>}
          {client.phone && <span>Tel: {client.phone}</span>}
        </div>
      </div>

      {/* Address & Locality */}
      <div className="w-full mb-2">
        <p className="text-[10px] uppercase tracking-wider text-main/50 font-semibold">Dirección</p>
        <p className="text-xs font-medium text-main/90 truncate" title={client.address}>
          {client.address || 'Sin dirección registrada'}
        </p>
        {locality && (
          <p className="text-[10px] text-main/50 truncate mt-0.5" title={locality}>
            {locality}
          </p>
        )}
      </div>

      {/* Days of Visit / Horarios de Atención */}
      <div className="w-full mb-2 py-1.5 px-2 rounded-dx bg-main/5 border border-main/10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-main/60 font-semibold">
            Días de visita
          </span>
          {commonSchedule && (
            <span className="text-[10px] font-mono text-focus-300 font-semibold">
              {commonSchedule}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {parsedDays.map((d) => (
            <div
              key={d.key}
              title={d.time ? `${d.fullName}: ${d.time}` : d.fullName}
              className={`size-5 rounded-full flex justify-center items-center text-[9px] font-semibold transition-colors ${d.hasVisit
                ? 'bg-focus-500 text-variant shadow-xs font-bold'
                : 'bg-main/10 text-main/40'
                }`}
            >
              {d.label}
            </div>
          ))}
        </div>

        {!commonSchedule && activeDays.length > 0 && uniqueSchedules.length > 1 && (
          <p className="text-[10px] text-main/50 italic mt-1 truncate">
            Horarios específicos por día
          </p>
        )}
        {activeDays.length === 0 && (
          <p className="text-[10px] text-main/40 italic mt-1">
            Sin días de visita definidos
          </p>
        )}
      </div>

      {/* Estado de Visita y Reparto */}
      <div className="flex items-center gap-1.5 mb-2">
        <div
          className={`px-2 py-1 rounded-dx text-[11px] font-semibold text-variant shadow-xs shrink-0 ${isVisited ? 'bg-status-success' : 'bg-status-error'
            }`}
        >
          PDV: #{client.clientId || clientId}
        </div>
        <div
          className={`px-2.5 py-1 rounded-dx text-[11px] font-semibold text-variant shadow-xs flex-1 truncate ${deliveryStatusClass}`}
        >
          {client.name || `Cliente #${clientId}`}
        </div>
      </div>
      {/* Financials: Invoices total & Balance */}
      {hasInvoices && (
        <div className="flex flex-col gap-1 py-1.5 border-t border-main/10">
          {hasInvoices && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold tracking-wider text-main/60 uppercase">
                Total Facturas
              </span>
              <span className="font-bold font-mono text-status-success text-xs">
                ${formatMoney(totalInvoicesAmount)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Logistic Observation */}
      {client.logisticObs && client.logisticObs.trim().length > 0 && (
        <div className="mt-1.5 p-1.5 rounded-dx bg-focus-500/10 border border-focus-500/20 text-main">
          <span className="text-[9px] font-bold uppercase tracking-wider text-focus-300 block mb-0.5">
            Obs. Logística
          </span>
          <p className="text-[11px] text-main/90 leading-tight italic break-words">
            {client.logisticObs}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryClientTooltip;
