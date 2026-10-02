import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useEditPolygonRef, useMenuRef, useModalRef, useModeRef } from "../../../utils/hooks/map/useContextRef";
import { HandGrabIcon, LocationExclamationIcon, NoWatchIcon, PencilIcon, TrashcanIcon } from '@repo/icons';
import { changeOneVisibility } from "../../../store/slices/sellerObserver/geozonesSlice";
import { changeOneVisibility as changeOneVisibilityDraft } from "../../../store/slices/planner/draftsSlice";
import { useDrag, getElementFromTree } from "@repo/map-core";
import DeleteGeoZone from "../../../components/layouts/sellerObserverLayout/sidebar/components/geoZones/components/deleteGeoZone";
import type { IGeneralGeoZone } from "../../../utils/types/geozones.types";
import { canDo } from "../../../utils/permissions/geozone.permissions";
import { useEffect, useState } from "react";
import { getMapModeRef } from "../strategy";


export interface IProps {
    x: number;
    y: number;
    geozone: IGeneralGeoZone;
}

const GeoZoneMenu = (props: IProps) => {
    const { mode } = useModeRef();
    const { CloseMenu } = useMenuRef();
    const { OpenModal } = useModalRef();
    const { enterprise, profile } = useAppSelector((state) => state.user);
    const { startLeftClickHold, isDragging } = useDrag();
    const dispatch = useAppDispatch();
    const { geozone } = props;

    const { handleStartEditing, restartEditing, handleConfirmEdition, handleCancelEdition, isEditing, polyId } = useEditPolygonRef();
    const mapRef = getMapModeRef(mode) as any;

    const polygon = getElementFromTree(mapRef?.geozoneElements, geozone.id, 'geozonePolygon', geozone.id);

    const [leaveZone, setLeaveZone] = useState(false);

    const onHide = () => {
        if ("draft_id" in geozone) {
            dispatch(changeOneVisibilityDraft({ group: 'geozones', id: geozone.id }))
        } else {
            dispatch(changeOneVisibility(geozone.id));
        }

        CloseMenu();
    }

    const onEdit = () => {
        if (polygon) {
            handleStartEditing(polygon, geozone.id)
        } else {
            restartEditing(geozone.coordinates);
        }
        CloseMenu();
    }

    const onCatch = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        startLeftClickHold(
            {
                originalEvent: e.nativeEvent,
            } as any,
            {
                id: geozone.id,
                color: geozone.color,
            }
        );
    };


    const handleMouseLeave = () => {
        if (!isDragging) {
            CloseMenu();
        } else {
            setLeaveZone(true);
        }
    };

    const handleMouseEnter = () => {
        setLeaveZone(false);
    };

    useEffect(() => {
        if (!isDragging && leaveZone) {
            CloseMenu();
            setLeaveZone(false);
        }
    }, [isDragging, leaveZone]);

    return (
        <>
            {geozone && (
                <div
                    className="absolute z-[999] flex items-center p-7"
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                    style={{
                        left: props.x,
                        top: props.y,
                        transform: "translate(-80%, -50%)",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="relative p-3 bg-primary-950/90 backdrop-blur-xl border border-main/10 rounded-dx shadow-2xl w-[200px] h-fit flex flex-col gap-y-2 items-center"
                    >
                        <h2 className="capitalize text-main font-bold text-sm truncate w-full text-center">{geozone.name}</h2>
                        <hr className="border-0 bg-main/10 h-px w-full my-0.5" />
                        <div className="w-full h-fit flex flex-col items-start gap-y-1.5">
                            {mode === 'planner' && (
                                <div
                                    className="w-full cursor-pointer px-2.5 py-1.5 flex justify-between items-center bg-primary-500/20 hover:bg-focus-500/30 border border-main/10 hover:border-focus-300/40 rounded-dx transition-colors duration-150 shadow-xs text-main/90 hover:text-main text-xs group"
                                    onMouseDown={onCatch}
                                >
                                    <p className="select-none">Arrastrar geozona</p>
                                    <HandGrabIcon className="fill-main/80 group-hover:fill-main size-3.5 transition-colors" />
                                </div>
                            )}
                            {!isEditing && (
                                <div
                                    className="w-full cursor-pointer px-2.5 py-1.5 flex justify-between items-center bg-primary-500/20 hover:bg-focus-500/30 border border-main/10 hover:border-focus-300/40 rounded-dx transition-colors duration-150 shadow-xs text-main/90 hover:text-main text-xs group"
                                    onClick={onHide}
                                >
                                    <p className="select-none">Ocultar geozona</p>
                                    <NoWatchIcon className="stroke-main/80 group-hover:stroke-main size-3.5 transition-colors" />
                                </div>
                            )}
                            {canDo(profile.permissions, 'EDIT') && (
                                <>
                                    {!isEditing && (
                                        <div
                                            className="w-full cursor-pointer px-2.5 py-1.5 flex justify-between items-center bg-primary-500/20 hover:bg-focus-500/30 border border-main/10 hover:border-focus-300/40 rounded-dx transition-colors duration-150 shadow-xs text-main/90 hover:text-main text-xs group"
                                            onClick={onEdit}
                                        >
                                            <p className="select-none">Editar geozona</p>
                                            <PencilIcon className="stroke-main/80 group-hover:stroke-main size-3.5 transition-colors" />
                                        </div>
                                    )}
                                    {isEditing && polyId === geozone.id && (
                                        <div className="relative w-full pt-3 mt-1.5 border-t border-main/10 gap-y-2">
                                            <span className="absolute -top-2 left-1 bg-focus-500 px-1.5 py-0 text-[8px] uppercase font-bold text-variant rounded-full border border-focus-300/50 shadow-xs">
                                                Modo Edición
                                            </span>

                                            <div className="flex gap-x-2 w-full">
                                                <div
                                                    className="w-1/2 cursor-pointer px-2 py-1.5 flex justify-center items-center bg-primary-900 hover:bg-error/20 border border-main/15 hover:border-error/40 rounded-dx transition-colors duration-150 text-main/80 hover:text-error text-xs uppercase shadow-xs"
                                                    onClick={handleCancelEdition}
                                                >
                                                    <p className="select-none">Cancelar</p>
                                                </div>
                                                <div
                                                    className="w-1/2 cursor-pointer px-2 py-1.5 flex justify-center items-center bg-focus-500 hover:bg-focus-300 border border-focus-300/50 rounded-dx transition-colors duration-150 text-variant text-xs font-bold uppercase shadow-xs"
                                                    onClick={handleConfirmEdition}
                                                >
                                                    <p className="select-none">Confirmar</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!isEditing && (
                                        <div
                                            className="w-full cursor-pointer px-2.5 py-1.5 flex justify-between items-center bg-error/20 hover:bg-error/40 border border-error/10 hover:border-error/40 rounded-dx transition-colors duration-150 shadow-xs text-error/90 hover:text-error text-xs group"
                                            onClick={() => OpenModal({ Component: <DeleteGeoZone geo={geozone} enterprise_id={enterprise.enterprise_id} />, isRequired: true })}
                                        >
                                            <p className="select-none">Eliminar geozona</p>
                                            <TrashcanIcon className="stroke-error/80 group-hover:stroke-error size-3.5 transition-colors" />
                                        </div>
                                    )}
                                </>
                            )}
                            {isEditing && polyId !== geozone.id && (
                                <div className="w-full p-2 bg-focus-500/20 border border-focus-300/40 rounded-dx flex justify-between items-center shadow-xs">
                                    <p className="text-focus-300 text-xs leading-tight font-semibold">
                                        Otra zona en edición
                                    </p>
                                    <LocationExclamationIcon className="stroke-focus-300 size-4" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <div
                        className="w-0 h-0
                        border-t-[10px] border-t-transparent
                        border-b-[10px] border-b-transparent
                        border-l-[8px] border-l-primary-950/90"
                    />
                </div>
            )}
        </>
    );
};

export default GeoZoneMenu;
