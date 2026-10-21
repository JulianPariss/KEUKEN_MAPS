import type {
  IFDeliveryClient,
  TFDeliveryClientCollectionStatus,
  TFDeliveryClientDeliveryStatus,
  TFDeliveryClientTerminalStatus,
} from '@repo/api-contracts/firebase';

export interface IDeliveryClientStatusBadge {
  key: string;
  label: string;
  className: string;
}

const normalize = (value?: string | null) =>
  (value || '').toString().trim().toUpperCase();

export const getDeliveryStatusBadge = (
  status?: TFDeliveryClientDeliveryStatus | null
): IDeliveryClientStatusBadge => {
  switch (normalize(status)) {
    case 'COMPLETELYDELIVERED':
      return { key: 'delivery', label: 'Entregado', className: 'bg-status-success' };
    case 'PARTIALLYDELIVERED':
      return { key: 'delivery', label: 'Entrega parcial', className: 'bg-status-warning' };
    case 'REJECTED':
      return { key: 'delivery', label: 'Rechazado', className: 'bg-status-error' };
    case 'PENDING':
    default:
      return { key: 'delivery', label: 'Entrega pendiente', className: 'bg-[#777778]' };
  }
};

export const getCollectionStatusBadge = (
  status?: TFDeliveryClientCollectionStatus | null
): IDeliveryClientStatusBadge => {
  switch (normalize(status)) {
    case 'COMPLETELYCOLLECTED':
      return { key: 'collection', label: 'Cobrado', className: 'bg-status-success' };
    case 'PARTIALLYCOLLECTED':
      return { key: 'collection', label: 'Cobro parcial', className: 'bg-status-warning' };
    case 'PENDING':
    default:
      return { key: 'collection', label: 'Cobro pendiente', className: 'bg-[#777778]' };
  }
};

export const getTerminalStatusBadge = (
  status?: TFDeliveryClientTerminalStatus | null
): IDeliveryClientStatusBadge | null => {
  switch (normalize(status)) {
    case 'REJECTED':
      return { key: 'terminal', label: 'Rechazado', className: 'bg-status-error' };
    case 'FORWARDED':
      return { key: 'terminal', label: 'Reprogramado', className: 'bg-[#7C3AED]' };
    default:
      return null;
  }
};

/** True when the client has a rejection amount recorded. */
export const hasDeliveryClientRejection = (
  client: Pick<IFDeliveryClient, 'rejectedAmount'>
): boolean => {
  const amount = Number(client.rejectedAmount);
  return Number.isFinite(amount) && amount > 0;
};

/** Rechazo total: deliveryStatus (o status terminal) = REJECTED. */
export const isTotalDeliveryRejection = (
  client: Pick<IFDeliveryClient, 'status' | 'deliveryStatus'>
): boolean =>
  normalize(client.deliveryStatus) === 'REJECTED' ||
  normalize(client.status) === 'REJECTED';

/**
 * Rechazo parcial: hay rejectedAmount pero la entrega no está en rejected
 * (p.ej. entrega parcial con parte rechazada).
 */
export const isPartialDeliveryRejection = (
  client: Pick<IFDeliveryClient, 'status' | 'deliveryStatus' | 'rejectedAmount'>
): boolean =>
  hasDeliveryClientRejection(client) && !isTotalDeliveryRejection(client);

/**
 * Badge extra solo para rechazo parcial.
 * En rechazo total ya alcanza el badge "Rechazado" de deliveryStatus/status.
 */
export const getRejectionBadge = (
  client: Pick<IFDeliveryClient, 'status' | 'deliveryStatus' | 'rejectedAmount'>
): IDeliveryClientStatusBadge | null => {
  if (!isPartialDeliveryRejection(client)) return null;
  return { key: 'rejection', label: 'Rechazo parcial', className: 'bg-status-error' };
};

/**
 * Badges de delivery/collection.
 * - Si `status` es terminal (REJECTED / FORWARDED): solo ese badge
 *   (no hay collectionStatus en ese caso).
 * - Si `deliveryStatus` es REJECTED: solo entrega + sin cobro pendiente.
 * - El rechazo parcial por rejectedAmount se agrega aparte (getRejectionBadge).
 */
export const getDeliveryClientStatusBadges = (
  client: Pick<IFDeliveryClient, 'status' | 'deliveryStatus' | 'collectionStatus'>
): IDeliveryClientStatusBadge[] => {
  const terminal = getTerminalStatusBadge(client.status);
  if (terminal) {
    return [terminal];
  }

  const delivery = getDeliveryStatusBadge(client.deliveryStatus);
  if (normalize(client.deliveryStatus) === 'REJECTED') {
    return [delivery];
  }

  return [delivery, getCollectionStatusBadge(client.collectionStatus)];
};
