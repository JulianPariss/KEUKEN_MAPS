import { useCallback, useEffect } from "react";
import { useMapPlannerContext, useMenuRef, useModeRef, useRenderRef } from "../../../../utils/hooks/map/useContextRef";
import CustomModal from "../../../../components/modal";
import { useAppSelector } from "../../../../store/hooks";
import {
    useCreatePath,
    useCreateCanva,
    MapContainer,
    indexToColor,
    type ICanvaMarkerCreationProps,
} from "@repo/map-core";
import { renderToString } from "react-dom/server";
import ClientHistoryTooltip from "../../components/clientHistoryTooltip";
import CustomMenu from "../../../../components/menu";
import GeoZoneMenu from "../../components/geozoneMenu";
import DraggableBox from "../../../../components/draggableBox";
import { createCircleSVG } from "../../../../utils/helpers/iconsGenerators";
import { getVisibilityState } from "../../../../utils/helpers/visibility";


const Planner = () => {
    const { OpenMenu } = useMenuRef();
    const { mapInteractions } = useModeRef();
    const mapContext = useMapPlannerContext();
    const { createPolygon, resetPathElements, handleTooltips, handleActions } = useCreatePath({ mapRef: mapContext.mapRef });
    const { handleCanvaMarkers, resetCanvaElements } = useCreateCanva({ mapRef: mapContext.mapRef });

    const { GEO_ZONES } = useRenderRef();
    const { geozones, watchList: geoWatchList, filterList: geoFilterList } = useAppSelector((state) => state.drafts.geozones);
    const { sellerById } = useAppSelector((state) => state.drafts.sellers);
    const { portfoliosById, porfolios } = useAppSelector((state) => state.portfolio);

    const { clients, watchList: historyWatchList, filterList } = useAppSelector((state) => state.drafts.history)
    const {
        geozoneElements,
        historyElements,
        markerLayerRef,
    } = mapContext;

    const geozonesPolygons = useCallback(() => {
        geozones.forEach((geo) => createPolygon({
            id: geo.id,
            polygonMapRef: 'geozonePolygon',
            operation: getVisibilityState(geo.id, geoWatchList, geoFilterList).visibleInMap ? 'add' : 'remove',
            options: { color: geo.color, fillOpacity: 0.35 },
            points: geo.coordinates as [number, number][],
            target: geozoneElements,
            tooltipLabel: geo.name,
            leftClickAction: (e) => {
                OpenMenu({ Component: GeoZoneMenu, props: { x: e.originalEvent.x, y: e.originalEvent.y, geozone: geo } })
            },
        }))

    }, [geoWatchList, geoFilterList, geozones, createPolygon])

    // Map initialization, teardown, and ResizeObserver are handled by <MapContainer />


    // Geo zones

    useEffect(() => {
        resetPathElements(geozoneElements);
        if (true) {
            geozonesPolygons();
        } else resetPathElements(geozoneElements);
    }, [geoWatchList, geoFilterList, geozones, GEO_ZONES])


    // History clients

    const historyClientsMarkers = useCallback(() => {
        clients.forEach((cl) => {
            const allPortfolio = cl.portfoliolist
                .map((portfolio) => {
                    const index = portfoliosById[portfolio.id];
                    return index !== undefined ? porfolios[index] : null;
                })
                .filter((p) => p !== null);


            const mobileid = allPortfolio[0]?.mobileUser ?? null;
            const color = sellerById?.[mobileid]?.color ?? indexToColor(Number(mobileid))
            const circleIcon = createCircleSVG(color);
            const parsedData: ICanvaMarkerCreationProps = {
                id: cl.id,
                pointData: {
                    id: cl.id,
                    coordinates: [cl.lat, cl.lon]
                },
                Icon: {
                    iconUrl: circleIcon,
                    size: 9,
                    zIndexOffset: -100000,
                },
                hoverAction: ((isHover, e) => {
                    const currentContent = isHover
                        ? renderToString(<ClientHistoryTooltip client={cl} allPortfolio={allPortfolio} />)
                        : '';
                    handleTooltips({
                        id: cl.id,
                        latlng: e._latlng,
                        operation: isHover ? 'move' : 'remove',
                        tooltipMapRef: 'sellPointTooltips',
                        target: historyElements,
                        content: currentContent,
                    });
                }),
                operation: (getVisibilityState(cl.id, historyWatchList, filterList).visibleInMap) ? 'add' : 'remove',
                markerMapRef: 'sellPointMarkers',
                target: historyElements,
                canvaLayer: markerLayerRef
            }

            handleCanvaMarkers(parsedData)
        })
    }, [
        clients,
        historyWatchList,
        filterList,
        handleCanvaMarkers,
        historyElements
    ])

    // Actions handlers 

    useEffect(() => {
        handleActions(historyElements);
        handleActions(geozoneElements)
    }, [mapInteractions]);

    useEffect(() => {
        resetCanvaElements(historyElements, markerLayerRef);

        if (true) {
            historyClientsMarkers();
        } else resetCanvaElements(historyElements, markerLayerRef)
    }, [historyWatchList, filterList])

    return (
        <div className="w-full h-full">
            <DraggableBox />
            <CustomModal />
            <CustomMenu />
            <MapContainer
                context={mapContext}
                markerLayerOptions={{ zIndex: 100000, pointerEvents: 'none' }}
                autoResize={true}
            />
        </div>
    );
}

export default Planner;