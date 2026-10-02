import { useState, useEffect } from "react";
import { newGeozone } from "../../../../../../../store/slices/sellerObserver/geozonesSlice";
import { useAppDispatch } from "../../../../../../../store/hooks";
import GeoModal from "./geoModal";
import { useEditPolygonRef, useMapSellerObserverContext, useModalRef, useModeRef } from "../../../../../../../utils/hooks/map/useContextRef";
import { capitalizeAllWords } from "../../../../../../../utils/helpers/formatters";
import { fetchAllTags } from "../../../../../../../store/slices/sellerObserver/tagsSlice";
import { AddOutlinedIcon, CheckOutlinedIcon, CrossOutlinedIcon } from '@repo/icons';
import type { IObserverGeodata } from "../../../../../../../utils/types/geozones.types";
import { usePolygonCreation } from "@repo/map-core";

interface IProps {
    isCreating: boolean;
    setIsCreating: (value: boolean) => void;
}

const CreateGeoZone = (props: IProps) => {
    const { isCreating: parentIsCreating, setIsCreating: setParentIsCreating } = props;
    const { isEditing, handleCancelEdition, handleConfirmEdition } = useEditPolygonRef();
    const { setMapInteractions } = useModeRef();
    const mapContext = useMapSellerObserverContext();
    const dispatch = useAppDispatch();
    const { OpenModal } = useModalRef();

    const [savedCoords, setSavedCoords] = useState<[number, number][] | null>(null);

    const onCreationSubmit = (geoData: IObserverGeodata) => {
        if (!savedCoords) return;
        try {
            const nameCapitalized = capitalizeAllWords(geoData.geoname ?? null);
            const data = {
                name: nameCapitalized,
                color: geoData.color,
                coordinates: savedCoords,
                tags: geoData.tags[0]?.labels ?? []
            };
            dispatch(newGeozone({ data }));
        } finally {
            dispatch(fetchAllTags());
            cancelCreation();
        }
    };

    const handlePolygonComplete = (coords: [number, number][]) => {
        setSavedCoords(coords);
        OpenModal({ Component: <GeoModal onModalSubmit={onCreationSubmit} />, isRequired: false });
    };

    const {
        isCreating,
        isAdjusting,
        startCreation,
        confirmCreation,
        cancelCreation,
    } = usePolygonCreation({
        mapContext,
        setMapInteractions,
        onPolygonCreated: handlePolygonComplete,
    });

    useEffect(() => {
        setParentIsCreating(isCreating || isAdjusting);
    }, [isCreating, isAdjusting, setParentIsCreating]);

    const btnnStyles = `size-6 rounded-full flex justify-center items-center bg-primary-900 border border-main/15 shadow-xs hover:scale-105 transition-all cursor-pointer`;
    const icnStyles = `size-4.5 stroke-main hover:stroke-focus-300 transition-colors`;

    return (
        <div className="flex justify-center items-center gap-x-1">
            {!isEditing ? (
                <>
                    {isAdjusting && (
                        <button
                            className={`${btnnStyles} !bg-focus-500 hover:!bg-focus-300 border-focus-300/50 shadow-xs`}
                            onClick={confirmCreation}
                        >
                            <CheckOutlinedIcon className="size-4.5 stroke-variant" />
                        </button>
                    )}
                    {(parentIsCreating || isCreating || isAdjusting) && (
                        <button
                            className={`${btnnStyles} !bg-error hover:!bg-error/80 border-error/50 shadow-xs`}
                            onClick={cancelCreation}
                        >
                            <CrossOutlinedIcon className="size-4.5 stroke-white" />
                        </button>
                    )}
                    {!parentIsCreating && !isCreating && !isAdjusting && (
                        <button
                            className={btnnStyles}
                            onClick={startCreation}
                        >
                            <AddOutlinedIcon className={icnStyles} />
                        </button>
                    )}
                </>
            ) : (
                <>
                    <button
                        className={`${btnnStyles} !bg-focus-500 hover:!bg-focus-300 border-focus-300/50 shadow-xs`}
                        onClick={handleConfirmEdition}
                    >
                        <CheckOutlinedIcon className="size-4.5 stroke-variant" />
                    </button>
                    <button
                        className={`${btnnStyles} !bg-error hover:!bg-error/80 border-error/50 shadow-xs`}
                        onClick={handleCancelEdition}
                    >
                        <CrossOutlinedIcon className="size-4.5 stroke-white" />
                    </button>
                </>
            )}
        </div>
    );
};

export default CreateGeoZone;
