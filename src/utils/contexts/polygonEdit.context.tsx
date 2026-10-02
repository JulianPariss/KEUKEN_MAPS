import React, { createContext } from "react";
import {
    PolygonEditProvider as CorePolygonEditProvider,
    usePolygonEdit as useCorePolygonEdit,
} from "@repo/map-core";
import { notify } from "../helpers/messageHelper";
import { useModalRef, useModeRef } from "../hooks/map/useContextRef";
import { fetchAllTags } from "../../store/slices/sellerObserver/tagsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getGeozones as getObserverGeozones } from "../../store/slices/sellerObserver/geozonesSlice";
import { getGeozones as getPlannerGeozones } from "../../store/slices/planner/draftsSlice";
import { editGeoZone as ObserverEditGeoZone } from "../../services/geozones.service";
import { editGeoZone as PlannerEditGeoZone } from "../../services/plannerServices/geozones.service";

import { default as ObserverGeoModal } from "../../components/layouts/sellerObserverLayout/sidebar/components/geoZones/components/geoModal";
import type { IGeoZone as IPlannerGeoZone } from "../types/planner/geozones.types";
import type { IGeoZone as IObserverGeoZone } from "../types/sellerObserver/geozones.types";
import { default as PlannerGeoModal } from "../../components/layouts/plannerLayout/sidebar/components/geoZones/components/geoModal";
import type { IGeoZoneObserver, IGeoZonePlanner, IObserverGeodata, IPlannerGeodata } from "../types/geozones.types";
import type { ICPDResponse } from "../types/general.types";

export interface IEditPolygonHandler {
    isEditing: boolean;
    polygon: any | null;
    handleStartEditing: (polygon: any, polyId: number) => void;
    restartEditing: (prevCoordinates: number[][]) => void;
    /** @deprecated Typo alias for restartEditing */
    restarEditing: (prevCoordinates: number[][]) => void;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    cleanStates: () => void;
    polyId: number | null;
    handleConfirmEdition: () => void;
    handleCancelEdition: () => void;
}

export const EditPolygonContext = createContext<IEditPolygonHandler | null>(null);

type AnyRawGeoZone = IObserverGeoZone | IPlannerGeoZone;
type AnyGeodata = IObserverGeodata | IPlannerGeodata;

export interface GeoEnvironment<T = IGeoZoneObserver | IGeoZonePlanner, D = AnyGeodata> {
    ModalComponent: React.ComponentType<any>;
    getGeozonesAction: () => any;
    selectGeozones: AnyRawGeoZone[];
    selectGeozonesById: Record<number, number> | number[];
    editEndpoint: (id: number, enterprise_id: number, data: any) => any;
    mapParams: (payload: ISubmissionPayload) => T;
    mapDefaultValues: (geozone: AnyRawGeoZone) => D;
    hasTags: boolean;
}

interface ISubmissionPayload {
    uiData?: AnyGeodata;    // Lo que viene del modal (inputs)
    coords?: number[][];    // Lo que viene del polígono de Leaflet
    rawGeozone: AnyRawGeoZone; // El objeto original de la zona
}

const EditPolygonContent = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const { mode } = useModeRef();
    const { OpenModal } = useModalRef();
    const { enterprise_id } = useAppSelector((state) => state.user.enterprise);

    const {
        isEditing,
        setIsEditing,
        polygon,
        polyId,
        handleStartEditing: coreStartEditing,
        restartEditing: coreRestartEditing,
        handleCancelEdition: coreCancelEdition,
        getEditedCoordinates,
        cleanStates,
    } = useCorePolygonEdit();

    const observerGeozones = useAppSelector((state) => state.geo.geozones);
    const observerGeozonesById = useAppSelector((state) => state.geo.geozonesById);
    const plannerGeozones = useAppSelector((state) => state.drafts.geozones.geozones);
    const plannerGeozonesById = useAppSelector((state) => state.drafts.geozones.geozonesById);

    const envConfig: any = 
     (mode === 'default' || mode === 'sellerObserver')
        ? {
            ModalComponent: ObserverGeoModal,
            getGeozonesAction: getObserverGeozones,
            selectGeozones: observerGeozones,
            selectGeozonesById: observerGeozonesById,
            editEndpoint: ObserverEditGeoZone,
            mapParams: ({ rawGeozone, uiData, coords }: ISubmissionPayload): IGeoZoneObserver => {
                const zone = rawGeozone as IObserverGeoZone;
                const data = uiData as IObserverGeodata;
                return {
                    id: zone.id,
                    name: data?.geoname ?? zone.name,
                    coordinates: coords ?? zone.coordinates,
                    color: data?.color ?? zone.color,
                    tags: data?.tags ?? zone.tags,
                };
            },
            mapDefaultValues: (geozone: AnyRawGeoZone): IObserverGeodata => {
                const zone = geozone as IObserverGeoZone;
                return {
                    id: zone.id,
                    geoname: zone.name,
                    color: zone.color,
                    tags: zone.tags,
                };
            },
            hasTags: true,
        }
        : {
            ModalComponent: PlannerGeoModal,
            getGeozonesAction: getPlannerGeozones,
            selectGeozones: plannerGeozones,
            selectGeozonesById: plannerGeozonesById,
            editEndpoint: PlannerEditGeoZone,
            mapParams: ({ rawGeozone, uiData, coords }: ISubmissionPayload): IGeoZonePlanner => {
                const zone = rawGeozone as IPlannerGeoZone;
                const data = uiData as IPlannerGeodata;
                return {
                    id: zone.id,
                    name: data?.geoname ?? zone.name,
                    coordinates: coords ?? zone.coordinates,
                    color: data?.color ?? zone.color,
                    original_geozone_id: zone.id,
                    tags: data?.tags ?? zone.tags,
                };
            },
            hasTags: true,
        };

    const { selectGeozones, selectGeozonesById, getGeozonesAction, ModalComponent, editEndpoint, mapParams, hasTags } = envConfig;

    const geozone = (polyId !== null) ? selectGeozones[selectGeozonesById[polyId as number]] : null;

    const handleStartEditing = (poly: any, id: number) => {
        if (isEditing) {
            notify('Para editar primero finalice la edición.', 'WARN');
            return;
        }
        coreStartEditing(poly, id);
    };

    const restartEditing = (prevCoordinates: number[][]) => {
        coreRestartEditing(prevCoordinates as [number, number][]);
    };

    const handleCancelEdition = () => {
        if (!polygon || !geozone) return;
        coreCancelEdition(geozone.coordinates as [number, number][]);
    };

    const onEditSubmit = (geoData: AnyGeodata) => {
        if (!polygon || !geozone) return;

        (polygon as any).editing?.disable();

        const data = mapParams({
            coords: getEditedCoordinates(),
            uiData: geoData,
            rawGeozone: geozone
        });

        const parsedData = (hasTags && data && 'tags' in data) ? {
            ...data,
            tags: (data as IGeoZoneObserver).tags[0]?.labels ?? []
        } : {
            ...data
        };

        editEndpoint(geozone.id, enterprise_id, parsedData).then((e: ICPDResponse | null) => {
            notify(e?.message ?? 'Se edito la geozona con éxito.', 'INFO');
            dispatch(getGeozonesAction());
        }).catch(() => {
            handleCancelEdition();
        }).finally(() => {
            dispatch(fetchAllTags());
            cleanStates();
        });

        if (typeof window !== 'undefined' && (window as any).L?.Edit?.Poly) {
            (polygon as any).editing = new (window as any).L.Edit.Poly(polygon, (polygon as any).options?.editing);
        }
    };

    const handleConfirmEdition = () => {
        if (geozone) {
            const parsedData = {
                ...mapParams({
                    rawGeozone: geozone
                })
            };
            OpenModal({
                Component:
                    <ModalComponent
                        onModalSubmit={onEditSubmit}
                        defaultValues={{
                            geoname: geozone?.name,
                            ...parsedData
                        }}
                    />,
                isRequired: false
            });
        }
    };

    const value: IEditPolygonHandler = {
        isEditing,
        setIsEditing,
        polygon,
        handleStartEditing,
        restartEditing,
        restarEditing: restartEditing,
        cleanStates,
        polyId: polyId as number | null,
        handleConfirmEdition,
        handleCancelEdition,
    };

    return (
        <EditPolygonContext.Provider value={value}>
            {children}
        </EditPolygonContext.Provider>
    );
};

export const EditPolygonProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <CorePolygonEditProvider>
            <EditPolygonContent>{children}</EditPolygonContent>
        </CorePolygonEditProvider>
    );
};
