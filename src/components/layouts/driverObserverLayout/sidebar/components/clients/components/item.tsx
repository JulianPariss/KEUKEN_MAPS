import { useRef, type RefObject } from "react";
import { useMapCore } from "@repo/map-core";
import { useNotifyRef } from "../../../../../../../utils/hooks/map/useContextRef";
import type { IFDeliveryClient } from "@repo/api-contracts/firebase";
import { MapIcon } from '@repo/icons';

interface IClientItem extends IFDeliveryClient {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const Item = (props: IClientItem) => {
    const ref = useRef<HTMLDivElement>(null);
    const { fitCoordinates } = useMapCore();
    const notify = useNotifyRef();

    const {
        id,
        name,
        address,
        location,
    } = props;

    const goToLocation = () => {
        if (location?.latitude && location?.longitude) {
            const lat = Number(location.latitude);
            const lng = Number(location.longitude);
            if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
                fitCoordinates([[lat, lng]]);
                return;
            }
        }
        notify('El cliente no posee coordenadas válidas', 'WARN');
    };

    return (
        <div ref={ref}
            className={
                `
                p-3 flex flex-col gap-y-1.5 rounded-dx 
                my-2 shadow-sm border border-main/10
                bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl
                `
            }>
            <div className="flex items-center justify-between">
                <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between items-start gap-2">
                        <div className="flex flex-col flex-1">
                            <h4
                                onClick={goToLocation}
                                className="text-sm font-bold text-main hover:text-focus-300 transition-colors cursor-pointer"
                            >
                                {`${name} | ${id}`}
                            </h4>
                            <p className="text-xs text-main/70 mt-0.5">
                                {address || 'Sin dirección'}
                            </p>
                        </div>
                        <button
                            type="button"
                            title="Centrar en el mapa"
                            onClick={goToLocation}
                            className="bg-primary-900/80 hover:bg-focus-500/30 border border-main/10 p-1.5 rounded-full flex justify-center items-center cursor-pointer size-7 transition-colors shadow-xs shrink-0"
                        >
                            <MapIcon className="size-4 stroke-main" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Item;
