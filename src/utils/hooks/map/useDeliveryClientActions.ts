import { useModalRef } from "./useContextRef";
import InvoiceModal from "../../../pages/home/components/invoiceModal";
import type { IFDeliveryClient } from "@repo/api-contracts/firebase";

export interface IDeliveryClientActionData {
  client: IFDeliveryClient;
  deliveryId?: number;
}

export interface IUseDeliveryClientActions {
  onClick: (data: IDeliveryClientActionData) => void;
  onLeftClick: (data: IDeliveryClientActionData) => void;
}

/**
 * Hook para manejar las acciones de click sobre los clientes de repartos en DriverObserver.
 * Replica la estructura de `useClientActions`, abriendo el modal `InvoiceModal` con la información del cliente.
 */
export const useDeliveryClientActions = (): IUseDeliveryClientActions => {
  const { OpenModal } = useModalRef();

  const clickActionDefault = (data: IDeliveryClientActionData): void => {
    const { client, deliveryId } = data;
    OpenModal({
      Component: InvoiceModal,
      props: { client, deliveryId },
    });
  };

  return {
    onClick: clickActionDefault,
    onLeftClick: clickActionDefault,
  };
};

export default useDeliveryClientActions;
