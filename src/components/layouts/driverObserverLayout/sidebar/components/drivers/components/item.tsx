import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
/* import StatusIcon from "./statusIcon"; */
import { MapIcon, NoWatchIcon, PauseIcon, PlayIcon, StatusIcon, ThumbTackIcon, WatchIcon } from '@repo/icons';
import { useCreatePath, useMapCore, indexToColor } from "@repo/map-core";
import { useAppDispatch, useAppSelector } from "../../../../../../../store/hooks";
import { useMapDriverObserverContext, useModalRef, useNotifyRef } from "../../../../../../../utils/hooks/map/useContextRef";
import DriverModal from "../../../../../../../pages/home/components/driverModal";
import CustomColorWheel from "../../../../../../customColorWheel";
import { setMobileUserColor } from "../../../../../../../services/sellers.service";
import type { IMobileUser } from "../../../../../../../utils/types/mobileUser.types";
import { isFocussed } from "../../../../../../../store/selectors/drivers.selector";
import { changeFocus, changeOneVisibility, changeSellerColor, setIsAnimating } from "../../../../../../../store/slices/driverObserver/driversSlice";
import { changeOneDeliveryVisibility } from "../../../../../../../store/slices/driverObserver/deliveriesSlice";
import type { IRoute } from "../../../../../../../utils/types/driverObserver/drivers.types";
import { formatMoney } from "../../../../../../../utils/helpers/formatters";
import DriverKpi from "./driverKpi";
import DotsLoader from "../../../../../components/dotsLoader";
import { useContextbarContext } from "../../../../../../../utils/contexts/contextbar.context";
import TimeLine from "./timeLine";
import type { IFDeliverie } from "@repo/api-contracts/firebase";

interface ISellerItem extends IMobileUser {
    isWatched: boolean;
    changeWatchedState: (id: number) => void;
    watchList: number[];
    routes: { [key: string]: IRoute[] };
    sidebarRef: RefObject<HTMLDivElement | null>;
    visibleTags: boolean;
}

const Item = (props: ISellerItem) => {
    const { configByDriverId } = useAppSelector((state) => state.drivers)
    const SNAKEIT = true;
    const ref = useRef<HTMLDivElement>(null);

    // DEV Variables
    const { driverElements, mapRef } = useMapDriverObserverContext();
    const { enterprise } = useAppSelector((state) => state.user);
    //

    const {
        name,
        isWatched,
        color,
        id,
        changeWatchedState,
        routes,
        sidebarRef,
        visibleTags,
        tags
    } = props;

    // Consumo de entregas desde deliveriesSlice mediante la lookup table deliveriesByDriverId
    const { deliveriesByDriverId, watchList: deliveryWatchList, loading: isLoadingDeliveries } = useAppSelector((state) => state.deliveries);
    const driverDeliveries = deliveriesByDriverId[id] ?? [];

    // Cálculo de totalizadores sumando los valores de todos los repartos del conductor
    const summaryStats = useMemo(() => {
        let balanceTotal = 0;
        let bulksTotal = 0;
        let clientsTotal = 0;
        let cashTotal = 0;
        let checkingAccountTotal = 0;
        let weightTotal = 0;

        for (const d of driverDeliveries) {
            balanceTotal += Number(d.balance || 0);
            bulksTotal += Number(d.bulks || 0);
            clientsTotal += Number(d.clientsCount || 0);
            cashTotal += Number(d.totalInCash || 0);
            checkingAccountTotal += Number(d.totalInCheckingAccount || 0);
            weightTotal += Number(d.weight || 0);
        }

        return {
            balanceTotal,
            bulksTotal,
            clientsTotal,
            cashTotal,
            checkingAccountTotal,
            weightTotal,
            deliveriesCount: driverDeliveries.length,
        };
    }, [driverDeliveries]);

    // Repartos ordenados por ID
    const sortedDeliveries = useMemo(() => {
        return [...driverDeliveries].sort((a, b) => a.id - b.id);
    }, [driverDeliveries]);

    const points = routes ? Object.entries(routes)
        .map(([_, value]) => value.map(r => [Number(r.lat), Number(r.lon)] as [number, number]))
        .reduce<[number, number][]>((acc, curr) => acc.concat(curr), []) : [];
    const hasRoute = points.length > 0;

    const { toggle, openKey } = useContextbarContext();
    const { clientIdsByDeliveryId, clientById } = useAppSelector((state) => state.deliveryClients);

    const { watchList, animation } = useAppSelector((state) => state.drivers);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [colorF, setColorF] = useState<string>(color ?? indexToColor(id));
    const isFocus = useAppSelector(isFocussed(id));
    const dispatch = useAppDispatch();
    const notify = useNotifyRef();
    const { OpenModal } = useModalRef();
    const { fitCoordinates } = useMapCore();

    const handleToggleTimeLine = (delivery: IFDeliverie) => {
        const deliveryKey = `delivery-timeline-${delivery.id}`;

        if (!isWatched) {
            changeWatchedState(id);
        }

        if (!deliveryWatchList.includes(delivery.id)) {
            dispatch(changeOneDeliveryVisibility(delivery.id));
        }

        const deliveryClientIds = clientIdsByDeliveryId[delivery.id] || [];
        const clientCoords: [number, number][] = deliveryClientIds
            .map((cid) => {
                const c = clientById[cid];
                if (c?.location?.latitude && c?.location?.longitude) {
                    const lat = Number(c.location.latitude);
                    const lng = Number(c.location.longitude);
                    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
                        return [lat, lng] as [number, number];
                    }
                }
                return null;
            })
            .filter((coord): coord is [number, number] => coord !== null);

        if (clientCoords.length > 0) {
            fitCoordinates(clientCoords);
        }

        toggle(
            <TimeLine
                delivery={delivery}
                driverId={id}
            />,
            <h2 className="text-main font-semibold flex items-center">
                Reparto <span className="text-focus-300 ml-1 font-mono before:content-['#']">{delivery.id}</span>
                <span className="text-main/40 mx-1.5 font-normal">·</span>
                <span className="text-xs text-main/70 font-normal truncate max-w-[130px]">{name}</span>
            </h2>,
            deliveryKey
        );
    };

    const handleFocusDelivery = (delivery: IFDeliverie) => {
        if (!isWatched) {
            changeWatchedState(id);
        }

        if (!deliveryWatchList.includes(delivery.id)) {
            dispatch(changeOneDeliveryVisibility(delivery.id));
        }

        const deliveryClientIds = clientIdsByDeliveryId[delivery.id] || [];
        const clientCoords: [number, number][] = deliveryClientIds
            .map((cid) => {
                const c = clientById[cid];
                if (c?.location?.latitude && c?.location?.longitude) {
                    const lat = Number(c.location.latitude);
                    const lng = Number(c.location.longitude);
                    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
                        return [lat, lng] as [number, number];
                    }
                }
                return null;
            })
            .filter((coord): coord is [number, number] => coord !== null);

        if (clientCoords.length > 0) {
            fitCoordinates(clientCoords);
        } else {
            notify('Este reparto no posee paradas con coordenadas válidas', 'WARN');
        }
    };

    const imAnimated = animation.isAnimating && animation.driverAnimated === id;

    const { snakePolyLines, changePolylineColor } = useCreatePath({
        mapRef,
        onAnimationStart: (animatedId) => {
            dispatch(setIsAnimating({ isAnimating: true, driverAnimated: Number(animatedId) }));
            setIsPaused(false);
        },
        onAnimationStop: () => {
            dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
            setIsPaused(false);
        },
        onAnimationEnd: () => {
            dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
            setIsPaused(false);
        },
    });

    const Label = ({ name }: { name: string }) => {
        return (
            <div className="px-2.5 py-0.5 rounded-dx cursor-pointer bg-focus-500 border border-focus-300/40 shadow-xs">
                <p className="text-center text-xs text-variant font-medium">{name}</p>
            </div>
        );
    };

    //Color picker
    const [isPickingColor, setIsPickingColor] = useState<boolean>(false);

    const stopDriverSnakes = useCallback(() => {
        snakePolyLines({
            id,
            target: driverElements,
            polylineMapRef: "routePolyline",
            operation: 'stop',
            routes,
        });
        setIsPaused(false);
        dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
    }, [dispatch, id, driverElements, routes, snakePolyLines]);

    useEffect(() => {
        if (isFocus && ref.current && sidebarRef.current) {
            const offset = 135;
            const parentRect = sidebarRef.current.getBoundingClientRect();
            const elementTop = ref.current.getBoundingClientRect().top + window.pageYOffset;

            const scrollTop = sidebarRef.current.scrollTop;
            const elementTopRelativeToParent = elementTop - parentRect.top;

            sidebarRef.current.scrollTo({
                top: scrollTop + elementTopRelativeToParent - offset,
                behavior: 'smooth',
            });
        }
    }, [isFocus]);

    const imAnimatedRef = useRef(imAnimated);
    imAnimatedRef.current = imAnimated;

    const stopDriverSnakesRef = useRef(stopDriverSnakes);
    stopDriverSnakesRef.current = stopDriverSnakes;

    // Safety cleanup: ONLY runs when component unmounts
    useEffect(() => {
        return () => {
            if (imAnimatedRef.current) {
                stopDriverSnakesRef.current();
            }
        };
    }, []);

    const focusOnDriver = () => {
        if (isFocus && imAnimated) {
            stopDriverSnakes();
        }
        dispatch(changeFocus(id));
        if (!isFocus && points.length > 0) {
            fitCoordinates(points);
        }
    };

    const snakeOnDriver = (control: 'start-stop' | 'pause-resume') => {
        if (control === 'start-stop') {
            if (imAnimated) {
                stopDriverSnakes();
            } else {
                setIsPaused(false);
                snakePolyLines({
                    id,
                    target: driverElements,
                    polylineMapRef: "routePolyline",
                    operation: 'start',
                    routes
                });
            }
        } else {
            const nextPaused = !isPaused;
            setIsPaused(nextPaused);
            snakePolyLines({
                id,
                target: driverElements,
                polylineMapRef: "routePolyline",
                operation: nextPaused ? 'pause' : 'resume',
                routes
            });
        }
    };

    const goToPolyline = () => {
        if (!hasRoute) {
            notify('El conductor seleccionado no posee una ruta válida', 'WARN');
            return;
        }
        if (points.length > 0) {
            fitCoordinates(points);
        }
        if (!watchList.includes(id)) {
            dispatch(changeOneVisibility(id));
        }
    };

    const handleChangeColor = (color: string) => {
        setMobileUserColor(id, color, enterprise.enterprise_id).then(() => {
            notify('Color del conductor modificado con éxito', 'SUCCESS');
            dispatch(changeSellerColor({ driverId: id, color }));
            changePolylineColor({
                id: id,
                polylineMapRef: "routePolyline",
                target: driverElements,
                options: {
                    color
                }
            });
            setColorF(color);
        }).catch(() => {
            notify('Ocurrio un error al modificar el color', 'ERROR');
        });
    };

    return (
        <div ref={ref}
            className={
                `
                p-3 flex flex-col gap-y-2.5 rounded-dx 
                my-2 shadow-sm border border-main/10
                bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl
                `
            }>
            <div className="flex items-center justify-between">
                <div className="flex items-start w-full">
                    <div className="relative">
                        <CustomColorWheel isOpen={isPickingColor} setIsOpen={setIsPickingColor} handleSubmit={handleChangeColor} color={colorF} />
                    </div>
                    <div className="w-full flex flex-col">
                        <div className="w-full flex justify-between items-center">
                            <h4 onClick={goToPolyline} className="mr-2 text-sm font-bold text-main hover:text-focus-300 transition-colors cursor-pointer">{`${name} | ${id}`}</h4>
                            <div className="flex flex-row justify-between ml-3 gap-x-1">
                                <button
                                    title="Estadísticas del chofer"
                                    onClick={() => OpenModal({ Component: DriverModal, props: { driverId: id, userId: id } })}
                                    className="bg-primary-900/80 hover:bg-focus-500/30 border border-main/10 p-1 rounded-full flex justify-center items-center cursor-pointer size-6 transition-colors shadow-xs">
                                    <StatusIcon className="size-3.5 fill-main" />
                                </button>
                                {hasRoute && (
                                    <button
                                        onClick={() => {
                                            if (imAnimated) stopDriverSnakes();
                                            changeWatchedState(id);
                                        }}
                                        className="bg-primary-900/80 hover:bg-focus-500/30 border border-main/10 p-1 rounded-full flex justify-center items-center cursor-pointer size-6 transition-colors shadow-xs">
                                        {isWatched ? <WatchIcon className="size-3.5 stroke-main" /> : <NoWatchIcon className="size-3.5 stroke-main" />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-main/40">{`APP: ${configByDriverId[id]?.appVersion ?? 'Desconocida'}`}</span>
                    </div>
                </div>
            </div>

            {/* Separador y Resumen de Entregas */}
            <hr className="w-full border-main/10 mb-1 mt-0.5" />

            {/* Totalizadores cuantitativos (KPI) */}
            <DriverKpi summaryStats={summaryStats} isLoading={isLoadingDeliveries} />

            {/* Desglose financiero */}
            <div className="flex flex-col gap-y-1 text-xs mt-0.5">
                <div className="w-full flex justify-between items-center bg-primary-900/10 p-0.5">
                    <p className="text-main/80 ml-0.5">Total a contado:</p>
                    {isLoadingDeliveries ? (
                        <DotsLoader size="sm" />
                    ) : (
                        <p className="font-bold text-main mr-0.5">${formatMoney(summaryStats.cashTotal)}</p>
                    )}
                </div>
                <div className="w-full flex justify-between items-center bg-primary-900/10 p-0.5">
                    <p className="text-main/80 ml-0.5">Total a cuenta corriente:</p>
                    {isLoadingDeliveries ? (
                        <DotsLoader size="sm" />
                    ) : (
                        <p className="font-bold text-main mr-0.5">${formatMoney(summaryStats.checkingAccountTotal)}</p>
                    )}
                </div>
                <div className="w-full flex justify-between items-center bg-primary-950/10 p-0.5">
                    <p className="text-main font-semibold ml-0.5">Total a entregar:</p>
                    {isLoadingDeliveries ? (
                        <DotsLoader size="sm" />
                    ) : (
                        <p className="font-bold text-focus-300 mr-0.5">${formatMoney(summaryStats.cashTotal + summaryStats.checkingAccountTotal)}</p>
                    )}
                </div>
            </div>

            {/* Listado de Repartos ordenados por ID */}
            {sortedDeliveries.length > 0 && (
                <div className="flex flex-col gap-y-1.5 mt-1">
                    <hr className="w-full border-main/10 mb-1" />
                    <p className="text-xs text-main/60 font-medium ml-0.5">Repartos ({sortedDeliveries.length})</p>
                    {sortedDeliveries.map((delivery) => {
                        const deliveryKey = `delivery-timeline-${delivery.id}`;
                        const isTimeLineOpen = openKey === deliveryKey;

                        return (
                            <div key={delivery.id} className="flex items-center justify-between gap-2">
                                {/* Botón izquierdo: Estilo similar a seller timeline (MapIcon) */}
                                <button
                                    type="button"
                                    title={isTimeLineOpen ? "Cerrar línea de tiempo" : "Línea de tiempo"}
                                    onClick={() => handleToggleTimeLine(delivery)}
                                    className={`w-10 p-2 rounded-dx flex justify-center items-center cursor-pointer transition-all shadow-xs border shrink-0 ${isTimeLineOpen
                                        ? 'bg-focus-500 border-focus-300 text-variant shadow-focus-500/20'
                                        : 'bg-primary-900/80 hover:bg-focus-500/30 border-main/10 text-main'
                                        }`}
                                >
                                    <MapIcon className={`size-4 ${isTimeLineOpen ? 'stroke-variant' : 'stroke-main'}`} />
                                </button>

                                {/* Botón central: Título y enfocar paradas del reparto */}
                                <button
                                    type="button"
                                    title="Centrar paradas del reparto en el mapa"
                                    onClick={() => handleFocusDelivery(delivery)}
                                    className="border p-2 w-full rounded-dx shadow-xs cursor-pointer flex items-center justify-between transition-all bg-primary-900/80 hover:bg-primary-500/30 border-main/10 text-main"
                                >
                                    <p className="ml-2 text-xs font-semibold text-main">Reparto #{delivery.id}</p>
                                </button>

                                {/* Botón derecho: Estilo similar a drivers/index.tsx L138-L143 (WatchIcon) */}
                                <button
                                    type="button"
                                    title={deliveryWatchList.includes(delivery.id) ? "Ocultar reparto" : "Visualizar reparto"}
                                    onClick={() => dispatch(changeOneDeliveryVisibility(delivery.id))}
                                    className={`w-10 p-2 rounded-dx flex justify-center items-center cursor-pointer transition-all shadow-xs border ${deliveryWatchList.includes(delivery.id)
                                        ? 'bg-primary-900/80 border-main/10 text-main'
                                        : 'bg-primary-900/80 hover:bg-main/30 border-main/10 text-main'
                                        } shrink-0`}
                                >
                                    {deliveryWatchList.includes(delivery.id) ? (
                                        <WatchIcon className="size-4 stroke-main" />
                                    ) : (
                                        <NoWatchIcon className="size-4 stroke-main" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Acciones de ruta del chofer (Seleccionar / Deseleccionar y Reproducción de recorrido) */}
            {hasRoute && (
                <>
                    <hr className="w-full border-main/10 my-0.5" />
                    <div className="flex justify-between items-center gap-2">
                        <button
                            className={`border p-2 w-full rounded-dx shadow-xs cursor-pointer flex items-center justify-between transition-all ${isFocus
                                ? 'bg-focus-500 text-variant border-focus-300/60 shadow-focus-500/20'
                                : 'bg-primary-900/80 hover:bg-primary-500/30 border-main/10 text-main'
                                }`}
                            onClick={focusOnDriver}>
                            {isFocus ? <p className="ml-2 text-xs font-semibold">Deseleccionar ruta</p> : <p className="ml-2 text-xs font-semibold">Seleccionar ruta</p>}
                            <ThumbTackIcon className={`${isFocus ? 'fill-variant' : 'fill-main/50'} size-3.5 mr-1`} />
                        </button>
                        {SNAKEIT && isFocus ? (
                            <>
                                <button
                                    onClick={() => snakeOnDriver('start-stop')}
                                    className="bg-focus-500 hover:bg-focus-300 w-fit p-2.5 rounded-dx text-variant shadow-xs cursor-pointer flex justify-between items-center transition-colors">
                                    {imAnimated ? (
                                        <div className="bg-variant size-3 rounded-xs" />
                                    ) : (
                                        <PlayIcon className="fill-variant size-3" />
                                    )}
                                </button>
                                <button
                                    disabled={!imAnimated}
                                    onClick={() => snakeOnDriver('pause-resume')}
                                    className={`${imAnimated ? "bg-focus-500 hover:bg-focus-300 cursor-pointer" : 'bg-focus-500/40 opacity-50 cursor-not-allowed'} w-fit p-2.5 rounded-dx text-variant shadow-xs flex justify-between items-center transition-colors`}>
                                    {isPaused ? (
                                        <PlayIcon className="fill-variant size-3" />
                                    ) : (
                                        <PauseIcon className="fill-variant size-3" />
                                    )}
                                </button>
                            </>
                        ) : null}
                    </div>
                </>
            )}

            {/* Tags / Etiquetas */}
            <div className="flex flex-wrap gap-2">
                {visibleTags &&
                    tags.map((tag) =>
                        tag.labels.map((key) => {
                            return <Label key={key} name={key} />
                        })
                    )}
            </div>
        </div>
    );
};

export default Item;

