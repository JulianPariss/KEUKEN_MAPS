import Item from "./item";
import { useCreatePath } from "@repo/map-core";
import type { IClient } from "../../../../../../../../utils/types/sellerObserver/clients.types";
import { useMapSellerObserverContext } from "../../../../../../../../utils/hooks/map/useContextRef";
import { useCallback } from "react";

interface IProps {
  clients: IClient[];
  sellerId: number | string;
}

const ClientsList = (props: IProps) => {
  const { clients, sellerId } = props;
  const { sellerElements, mapRef } = useMapSellerObserverContext();
  const { focusOnMarker } = useCreatePath({ mapRef });

  const handleFocus = useCallback(
    (subId: string | number) => {
      focusOnMarker({
        id: sellerId,
        subId,
        target: sellerElements,
        markerMapRef: "sellPointMarkers",
      });
    },
    [focusOnMarker, sellerId, sellerElements]
  );

  return (
    <div>
      {clients.map((client, index) => (
        <Item
          onClick={() => handleFocus(client.code)}
          key={`${index}-${client.code}`}
          client={client}
        />
      ))}
    </div>
  );
};

export default ClientsList;
