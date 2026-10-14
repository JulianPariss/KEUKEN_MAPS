import { useEffect, useState } from "react";
import { NoWatchIcon, PencilIcon, StallIcon, TrashcanIcon, WatchIcon } from '@repo/icons';
import { useAppDispatch } from "../../../../../../../store/hooks";
import { changeOneVisibility } from "../../../../../../../store/slices/sellerObserver/geozonesSlice";
import { type IGeoZone } from "../../../../../../../utils/types/sellerObserver/geozones.types";
import { useMapSellerObserverContext, useModalRef, useNotifyRef } from "../../../../../../../utils/hooks/map/useContextRef";
import { getElementFromTree, useMapCore } from "@repo/map-core";
import DeleteGeoZone from "./deleteGeoZone";
import { canDo } from "../../../../../../../utils/permissions/geozone.permissions";


interface IProps {
    geo: IGeoZone;
    enterprise_id: number;
    isWatched: boolean;
    onEdit: (polygon: any, geoId: number) => void;
    isEditing: boolean;
    isCreating: boolean;
    visibleTags: boolean;
    permissions: string[];
}

const Item = (props: IProps) => {
    const dispatch = useAppDispatch();
    const notify = useNotifyRef()
    const { fitCoordinates } = useMapCore();

    const [canUse, setCanUse] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);

    const { OpenModal } = useModalRef();
    const { geozoneElements } = useMapSellerObserverContext();
    const { geo, enterprise_id, isWatched, onEdit, isEditing, isCreating, visibleTags, permissions } = props;


    const polygon = getElementFromTree(geozoneElements, geo.id, 'geozonePolygon', geo.id);

    const changeWatchedState = (id: number) => {
        dispatch(changeOneVisibility(id));
    }

    const focusOnMap = () => {
        if (geo.coordinates && geo.coordinates.length > 0) {
            fitCoordinates(geo.coordinates as [number, number][]);
        }
    }

    const Label = ({ name }: { name: string }) => {
        return (
            <div className="p-1 rounded-dx px-2.5 bg-focus-500 border border-focus-300/50 text-variant shadow-xs">
                <p className="text-center text-xs font-medium">{name}</p>
            </div>
        );
    };

    useEffect(() => {
        setCanUse(!isEditing && !isCreating);
        setCanEdit(!isEditing && !isCreating && isWatched);
    }, [isEditing, isCreating, polygon, isWatched]);

    return (
        <div className="flex flex-col w-full bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl p-3 rounded-dx my-2 border border-main/10 hover:border-focus-300/80 transition-all shadow-xs group">
            <div className="flex flex-col">
                <div onClick={focusOnMap} className="flex justify-between items-center cursor-pointer">
                    <h2 className="text-main font-semibold text-sm capitalize truncate leading-tight group-hover:text-focus-300 transition-colors">{geo.name}</h2>
                    <div className="size-3.5 rounded-full border border-main/20 shadow-xs flex-shrink-0" style={{ backgroundColor: geo.color }} />
                </div>
                <div className="flex flex-row-reverse justify-between items-center w-full mt-2">
                    <div className="flex justify-end items-center" title="Clientes dentro de la zona">
                        <p className="text-main/60 text-xs font-medium mr-1">{geo.total_clients}</p>
                        <StallIcon className="size-4.5 p-0.5 fill-focus-100" />
                    </div>
                    <div className="flex gap-x-1">
                        {canDo(
                            permissions,
                            'EDIT'
                        ) && (
                                <>
                                    <div
                                        onClick={() => {
                                            if (canEdit && polygon) {
                                                focusOnMap();
                                                onEdit(polygon, geo.id);
                                            } else {
                                                notify('No es posible editar la Geo Zona', 'WARN');
                                            }
                                        }}
                                        className={`size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center transition-all ${canEdit ? 'cursor-pointer hover:bg-focus-500 hover:border-focus-300 group/edit' : 'cursor-not-allowed opacity-35'}`}
                                    >
                                        <PencilIcon className="stroke-main group-hover/edit:stroke-variant size-3.5 transition-colors" />
                                    </div>
                                    <div
                                        onClick={() => { canUse ? OpenModal({ Component: <DeleteGeoZone geo={geo} enterprise_id={enterprise_id} />, isRequired: true }) : notify('Para eliminar primero termine la edición.', 'WARN'); }}
                                        className={`size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center transition-all ${canUse ? 'cursor-pointer hover:bg-error hover:border-error/50 group/delete' : 'cursor-not-allowed opacity-35'}`}
                                    >
                                        <TrashcanIcon className="stroke-main group-hover/delete:stroke-variant size-3.5 transition-colors" />
                                    </div>
                                </>
                            )}
                        <button
                            onClick={() => { canUse ? changeWatchedState(geo.id) : notify('Para ocultar o visualizar debe terminar la edición.', 'WARN'); }}
                            className={`size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center transition-all ${canUse ? 'cursor-pointer hover:bg-focus-500 hover:border-focus-300 group/watch' : 'cursor-not-allowed opacity-35'}`}
                        >
                            {isWatched ? <WatchIcon className="size-3.5 stroke-main group-hover/watch:stroke-variant transition-colors" /> : <NoWatchIcon className="size-3.5 stroke-main group-hover/watch:stroke-variant transition-colors" />}
                        </button>
                    </div>
                </div>
                {visibleTags && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {geo.tags.map((tag) =>
                            tag.labels.map((key, index) => (
                                <Label key={index} name={key} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Item;
