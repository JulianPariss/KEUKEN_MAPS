import { getIcon } from "../../helpers/orderIconPicker";
import type { TClientStatus } from "../../types/sellerObserver/clients.types";
import OrderModal from "../../../pages/home/components/orderModal";
import { useMapSellerObserverContext, useModalRef, useNotifyRef } from "./useContextRef";
import {
  useCreatePath,
  calculateDistance,
  formatDistance,
  applyCoordinateOffset,
} from "@repo/map-core";
import ClientModal from "../../../pages/home/components/clientModal";
import type { IClient } from "../../types/sellerObserver/clients.types";

interface IData {
  polylines: any[];
  keyNumber: number;
  client: IClient;
}

interface IUseClientActions {
  onClick: (clientStatus: TClientStatus, data: IData) => void;
  onLeftClick: (clientStatus: TClientStatus, data: IData) => void;
}

const useClientActions = (): IUseClientActions => {
  const { sellerElements, mapRef } = useMapSellerObserverContext();
  const { createPolyLine, handleMarkers, handleTooltips } = useCreatePath({ mapRef });
  const { OpenModal } = useModalRef();
  const notify = useNotifyRef();

  const leftClickActionDefault = (data: IData): void => {
    const OFFSET_METERS = 0.0003;
    const { polylines, keyNumber } = data;
    let closerItems = 0;
    {
      polylines.forEach((poly) => {
        const distMeters = calculateDistance(
          [poly.route[0][0], poly.route[0][1]],
          [poly.route[1][0], poly.route[1][1]]
        );

        const itsCloser = distMeters < 50;
        const origin: [number, number] = [poly.route[0][0], poly.route[0][1]];
        let closerRoute: [number, number][] = [];

        if (itsCloser) {
          const offsetPoint = applyCoordinateOffset(origin, OFFSET_METERS, closerItems);
          closerRoute = [origin, offsetPoint];
          closerItems >= 3 ? closerItems = 0 : closerItems++;
        }

        createPolyLine({
          id: keyNumber,
          subId: poly.id,
          polylineMapRef: 'clientToOrderPolylines',
          points: itsCloser ? closerRoute : poly.route,
          options: itsCloser ? { color: '#10a745', weight: 2, dashArray: '0, 0' } : { color: '#de7d45', weight: 4, dashArray: '3, 6' },
          operation: 'toggle',
          target: sellerElements,
          hoverAction: (isHover, e) => {
            handleTooltips({
              id: keyNumber,
              subId: poly.id,
              latlng: e.latlng,
              operation: isHover ? 'move' : 'remove',
              tooltipMapRef: 'distanceTooltips',
              target: sellerElements,
              content: formatDistance(distMeters),
            })
          }
        }),
          handleMarkers({
            id: keyNumber,
            pointData: { id: poly.id, coordinates: itsCloser ? closerRoute[1] : poly.orderPoint },
            Icon: { iconUrl: getIcon(poly.noSaleReason) },
            clickAction: () => { OpenModal({ Component: OrderModal, props: { orders: polylines.map((poly) => poly.order), sellerId: keyNumber, orderId: poly.id, polylines: polylines } }) },
            operation: 'toggle',
            markerMapRef: 'ordersMarkers',
            target: sellerElements
          })
      })
    }
  }

  const clickActionDefault = (data: IData): void => {
    {
      const { polylines, keyNumber } = data;
      {
        if (polylines[0] && polylines[0].id)
          OpenModal({ Component: OrderModal, props: { orders: polylines.map((poly) => poly.order), sellerId: keyNumber, orderId: polylines[0].id, polylines: polylines } })
        else OpenModal({ Component: ClientModal, props: { ...data.client, sellerId: keyNumber } }) //notify('No se encontro ninguna orden adjunta', 'WARN')
      }
    }
  }


  const actions: Record<TClientStatus, { clickAction: (data: IData) => void, leftClickAction: (data: IData) => void }> = {
    UNKOWN: {
      clickAction: (data): void => { clickActionDefault(data) },
      leftClickAction: (): void => notify('El cliente no fue visitado', 'WARN')
    },
    VISITED: {
      clickAction: (data): void => { clickActionDefault(data) },
      leftClickAction: (data): void => leftClickActionDefault(data)
    },
    NOVISITED: {
      clickAction: (data): void => { clickActionDefault(data) },
      leftClickAction: (data): void => leftClickActionDefault(data)
    },
    NOSALE: {
      clickAction: (data): void => { clickActionDefault(data) },
      leftClickAction: (data): void => leftClickActionDefault(data)
    },
    PENDING: {
      clickAction: (data): void => { clickActionDefault(data) },
      leftClickAction: (): void => notify('El cliente no fue visitado', 'WARN')
    }
  }

  const onClick = (clientStatus: TClientStatus, data: IData) => {
    return actions[clientStatus].clickAction(data);
  }

  const onLeftClick = (clientStatus: TClientStatus, data: IData) => {
    return actions[clientStatus].leftClickAction(data);
  }

  return {
    onClick,
    onLeftClick,
  }
}


export default useClientActions;