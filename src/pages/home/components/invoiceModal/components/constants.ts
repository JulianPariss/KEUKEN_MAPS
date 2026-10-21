export interface ITableHeader {
  id: number;
  key: string;
  width: string;
  title: string;
  prefix?: string;
}

export const tableHeaders: ITableHeader[] = [
  { id: 0, key: 'expand', title: '', width: '3' },
  { id: 1, key: 'description', title: 'Comprobante', width: '21', prefix: '#' },
  { id: 2, key: 'deliveryId', title: 'Reparto', width: '10', prefix: '#' },
  { id: 3, key: 'saleCondition', title: 'Cond. Venta', width: '15' },
  { id: 4, key: 'invoiceExpiration', title: 'Vencimiento', width: '12' },
  { id: 5, key: 'status', title: 'Estado', width: '12' },
  { id: 6, key: 'netAmount', title: 'Neto', width: '9', prefix: '$' },
  { id: 7, key: 'amount', title: 'Total', width: '9', prefix: '$' },
  { id: 8, key: 'balance', title: 'Saldo', width: '9', prefix: '$' },
];

export const INVOICE_STATUS_MAP: Record<string, string> = {
  DELIVERED: 'Entregado',
  COLLECTED: 'Cobrado',
  REJECTED: 'Rechazado',
  PENDING: 'Pendiente',
  PARTIALLY_COLLECTED: 'Cobrado Parcial',
  FORWARDED: 'Reprogramado',
};

export const INVOICE_STATUS_COLOR_MAP: Record<string, string> = {
  DELIVERED: 'bg-success',
  COLLECTED: 'bg-success',
  REJECTED: 'bg-error',
  PENDING: 'bg-warning',
  FORWARDED: 'bg-[#7C3AED]',
};

export const isForwardedInvoice = (invoice: {
  status?: string | null;
  statusDelivered?: string | null;
  originalDeliveryId?: number | null;
  deliveryId?: number | null;
}): boolean => {
  const status = (invoice.status || '').toUpperCase();
  const delivered = (invoice.statusDelivered || '').toUpperCase();
  if (status === 'FORWARDED' || delivered === 'FORWARDED') return true;
  const original = Number(invoice.originalDeliveryId);
  const current = Number(invoice.deliveryId);
  return (
    Number.isFinite(original) &&
    original > 0 &&
    Number.isFinite(current) &&
    current > 0 &&
    original !== current
  );
};

export const getInvoiceStatusLabel = (status: string): string => {
  if (!status) return '-';
  return INVOICE_STATUS_MAP[status.toUpperCase()] || status;
};

export const getInvoiceStatusColor = (status: string): string => {
  if (!status) return 'bg-main/40';
  return INVOICE_STATUS_COLOR_MAP[status.toUpperCase()] || 'bg-main/40';
};

export const INVOICE_ITEM_STATUS_MAP: Record<string, string> = {
  PENDING: 'Pendiente',
};

export const getInvoiceItemStatusLabel = (status?: string | null): string => {
  if (!status) return '-';
  const upper = status.toUpperCase();
  return INVOICE_ITEM_STATUS_MAP[upper] || status;
};

export const PAYMENT_KEY_LABELS: Record<string, string> = {
  account_owner: 'Titular de cuenta',
  reference: 'N° Comprobante / Ref',
  payment_date: 'Fecha de acreditación',
  amount: 'Importe',
  check_number: 'N° de cheque',
  due_date: 'Fecha de vencimiento',
  cuit: 'CUIT',
  bank: 'Banco',
};

