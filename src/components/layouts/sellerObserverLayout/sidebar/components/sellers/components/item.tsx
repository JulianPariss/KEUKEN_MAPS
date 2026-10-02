import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { IRoute, ISeller, TConnectionStatus } from "../../../../../../../utils/types/sellerObserver/sellers.types";
/* import StatusIcon from "./statusIcon"; */
import { MapIcon, NoWatchIcon, PauseIcon, PlayIcon, StatusIcon, ThumbTackIcon, WatchIcon } from '@repo/icons';
import { useCreatePath, useMapCore, indexToColor } from "@repo/map-core";
import { useAppDispatch, useAppSelector } from "../../../../../../../store/hooks";
import { getValhallaRoute } from "../../../../../../../services/locations.service";
import moment from "moment";
import { useMapSellerObserverContext, useModalRef, useNotifyRef } from "../../../../../../../utils/hooks/map/useContextRef";
import { changeFocus, changeOneVisibility, changeSellerColor, setIsAnimating } from "../../../../../../../store/slices/sellerObserver/sellersSlice";
import TimeLine from "./timeLine";
import { isFocussed } from "../../../../../../../store/selectors/sellers.selector";
import { formatMinutes, formatMoney } from "../../../../../../../utils/helpers/formatters";
import CustomColorWheel from "../../../../../../customColorWheel";
import { setMobileUserColor } from "../../../../../../../services/sellers.service";
import { useContextbarContext } from "../../../../../../../utils/contexts/contextbar.context";
import SellerModal from "../../../../../../../pages/home/components/sellerModal";
import { getComposedStats } from "../../../../../../../store/selectors/stats.selector";
import Kpi from "./kpi";
import DotsLoader from "../../../../../components/dotsLoader";

interface ISellerItem extends ISeller {
    isWatched: boolean;
    viewMode: string;
    changeWatchedState: (id: number) => void;
    status: TConnectionStatus;
    watchList: number[];
    routes: { [key: string]: IRoute[] };
    sidebarRef: RefObject<HTMLDivElement | null>;
    visibleTags: boolean;
}

const Item = (props: ISellerItem) => {
    const SHOWGPS = false;
    const SNAKEIT = true;
    const ref = useRef<HTMLDivElement>(null);
    const [hasFirstSell, _] = useState<boolean>(props.has_order);

    const { loading: isLoadingStats } = useAppSelector((state) => state.stats);
    const composedStats = useAppSelector(getComposedStats(props.seller));


    const { open, openKey, toggle, isOpen } = useContextbarContext();
    const { OpenModal } = useModalRef();

    // DEV Variables
    const { sellerElements, mapRef } = useMapSellerObserverContext();
    const { clientsBySeller } = useAppSelector((state) => state.clients)
    const { enterprise } = useAppSelector((state) => state.user)
    const { date } = useAppSelector((state) => state.sidebar)
    //

    const {
        sellerName,
        isWatched,
        color,
        seller,
        changeWatchedState,
        routes,
        sidebarRef,
        visibleTags,
        tags,
        viewMode
    } = props;


    const points = routes ? Object.entries(routes)
        .map(([_, value]) => value.map(r => [Number(r.lat), Number(r.lon)] as [number, number]))
        .reduce<[number, number][]>((acc, curr) => acc.concat(curr), []) : [];
    const hasRoute = points.length > 0;


    const { sellerOrders, watchList, animation, sellerGps, sellerById } = useAppSelector((state) => state.sellers);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [colorF, setColorF] = useState<string>(color ?? indexToColor(seller));
    const isFocus = useAppSelector(isFocussed(seller));
    const dispatch = useAppDispatch();
    const notify = useNotifyRef();
    const { fitCoordinates } = useMapCore();

    const imAnimated = animation.isAnimating && animation.sellerAnimated === seller;

    const { snakePolyLines, changePolylineColor, createPolyLine } = useCreatePath({
        mapRef,
        onAnimationStart: (animatedId) => {
            dispatch(setIsAnimating({ isAnimating: true, sellerAnimated: Number(animatedId) }));
            setIsPaused(false);
        },
        onAnimationStop: () => {
            dispatch(setIsAnimating({ isAnimating: false, sellerAnimated: null }));
            setIsPaused(false);
        },
        onAnimationEnd: () => {
            dispatch(setIsAnimating({ isAnimating: false, sellerAnimated: null }));
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

    const stopSellerSnakes = useCallback(() => {
        snakePolyLines({
            id: seller,
            target: sellerElements,
            polylineMapRef: "routePolyline",
            operation: 'stop',
            routes,
        });
        setIsPaused(false);
        dispatch(setIsAnimating({ isAnimating: false, sellerAnimated: null }));
    }, [dispatch, routes, seller, sellerElements, snakePolyLines]);

    useEffect(() => {
        if (isFocus && ref.current && sidebarRef.current) {
            const offset = 160;
            const parentRect = sidebarRef.current.getBoundingClientRect();
            const elementTop = ref.current.getBoundingClientRect().top + window.pageYOffset;

            const scrollTop = sidebarRef.current.scrollTop;
            const elementTopRelativeToParent = elementTop - parentRect.top;

            sidebarRef.current.scrollTo({
                top: scrollTop + elementTopRelativeToParent - offset,
                behavior: 'smooth',
            });
        }

        if (isFocus && isOpen) {
            open(
                <TimeLine
                    orders={sellerOrders.orders[seller] ?? []}
                    clients={cList}
                    seller={seller}
                    gps={sellerGps.gps[seller] ?? []}
                    clientsBySeller={clientsBySeller}
                />,
                <h2 className="text-main font-semibold">{sellerById[seller].sellerName}<span className="text-focus-300 before:content-['#'] ml-2">{seller}</span></h2>,
                `timeline-${seller}`
            );
        }
    }, [isFocus, viewMode]);

    const imAnimatedRef = useRef(imAnimated);
    imAnimatedRef.current = imAnimated;

    const stopSellerSnakesRef = useRef(stopSellerSnakes);
    stopSellerSnakesRef.current = stopSellerSnakes;

    // Safety cleanup: ONLY runs when component unmounts
    useEffect(() => {
        return () => {
            if (imAnimatedRef.current) {
                stopSellerSnakesRef.current();
            }
        };
    }, []);

    const focusOnSeller = () => {
        if (isFocus && imAnimated) {
            stopSellerSnakes();
        }
        dispatch(changeFocus(seller));
        if (!isFocus && points.length > 0) {
            fitCoordinates(points);
        }
    };

    const snakeOnSeller = (control: 'start-stop' | 'pause-resume') => {
        if (control === 'start-stop') {
            if (imAnimated) {
                stopSellerSnakes();
            } else {
                setIsPaused(false);
                snakePolyLines({
                    id: seller,
                    target: sellerElements,
                    polylineMapRef: "routePolyline",
                    operation: 'start',
                    routes
                });
            }
        } else {
            const nextPaused = !isPaused;
            setIsPaused(nextPaused);
            snakePolyLines({
                id: seller,
                target: sellerElements,
                polylineMapRef: "routePolyline",
                operation: nextPaused ? 'pause' : 'resume',
                routes
            });
        }
    };

    const goToPolyline = () => {
        if (!hasRoute) {
            notify('El vendedor seleccionado no posee coordenadas', 'WARN');
            return;
        }

        open(
            <TimeLine
                orders={sellerOrders.orders[seller] ?? []}
                clients={cList}
                seller={seller}
                gps={sellerGps.gps[seller] ?? []}
                clientsBySeller={clientsBySeller}
            />,
            <h2 className="text-main font-semibold">{sellerById[seller].sellerName}<span className="text-focus-300 before:content-['#'] ml-2">{seller}</span></h2>,
            `timeline-${seller}`
        );

        if (points.length > 0) {
            fitCoordinates(points);
        }
        if (!watchList.includes(seller)) {
            dispatch(changeOneVisibility(seller));
        }
    };


    // DEV Functions
    const parseCoordinates = (routes: any[]) => {
        return routes.filter((e) => e.orderType === -2).map((route) => [route.lat, route.lon] as [number, number]);
    };

    const drawValhallaLine = async (id: number) => {
        getValhallaRoute({
            enterprise_id: enterprise.enterprise_id,
            fecha_inicio: moment(date).format('YYYY-MM-DD').toString(),
            mobileUser: id
        }).then((res) => {
            const parsedRoute = parseCoordinates(res);
            createPolyLine({
                id,
                subId: `valhalla_${id}`,
                polylineMapRef: "routePolyline",
                points: parsedRoute,
                options: { color: '#ff00ffcc', dashArray: '5px, 5px', weight: 2 },
                operation: 'add',
                target: sellerElements
            });
        });
    };
    //

    const cList = clientsBySeller[seller] ?? [];
    const tInPdv = cList.reduce((acc, item) => acc + item.totalMinutes, 0);


    const handleChangeColor = (color: string) => {
        setMobileUserColor(seller, color, enterprise.enterprise_id).then(() => {
            notify('Color del vendedor modificado con éxito', 'SUCCESS');
            dispatch(changeSellerColor({ sellerId: seller, color }));
            changePolylineColor({
                id: seller,
                polylineMapRef: "routePolyline",
                target: sellerElements,
                options: {
                    color
                }
            });
            setColorF(color);
        }).catch(() => {
            notify('Ocurrio un error al modificar el color', 'ERROR');
        });
    };

    const cntxbarOpen = openKey === `timeline-${seller}`;
    const hasData = props.state !== '-';

    return (
        <div ref={ref}
            className={
                `
                p-3 flex flex-col gap-y-2.5 rounded-dx 
                my-2 shadow-sm border
                bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl
                ${hasFirstSell ? 'border-focus-300/80 grayscale-0' : 'border-main/10'}
                ${hasData ? 'grayscale-0' : 'grayscale-25 opacity-80'}
                `
            }>
            <div className="flex items-center justify-between">
                <div className="flex items-start w-full">
                    <div className="relative">
                        <CustomColorWheel disabled={!hasData} isOpen={isPickingColor} setIsOpen={setIsPickingColor} handleSubmit={handleChangeColor} color={colorF} />
                    </div>
                    <div className="w-full flex flex-col">
                        <div className="w-full flex justify-between items-center">
                            <h4 onClick={goToPolyline} className="mr-2 text-sm font-bold text-main hover:text-focus-300 transition-colors cursor-pointer">{`${sellerName} | ${seller}`}</h4>
                            <div className="flex flex-row justify-between ml-3 gap-x-1">
                                <button
                                    onClick={() => OpenModal({ Component: SellerModal, props: { userId: seller } })}
                                    className="bg-primary-900/80 hover:bg-focus-500/30 border border-main/10 p-1 rounded-full flex justify-center items-center cursor-pointer size-6 transition-colors shadow-xs">
                                    <StatusIcon className="size-3.5 fill-main" />
                                </button>
                                {hasRoute && (
                                    <button
                                        onClick={() => {
                                            if (imAnimated) stopSellerSnakes();
                                            changeWatchedState(seller);
                                        }}
                                        className="bg-primary-900/80 hover:bg-focus-500/30 border border-main/10 p-1 rounded-full flex justify-center items-center cursor-pointer size-6 transition-colors shadow-xs">
                                        {isWatched ? <WatchIcon className="size-3.5 stroke-main" /> : <NoWatchIcon className="size-3.5 stroke-main" />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className="text-xs text-main/40">{`APP: ${props.app_version}`}</span>
                    </div>
                </div>
            </div>
            {hasData ? (
                <>
                    <div>
                        <hr className="w-full border-main/10 mb-3 mt-1" />
                        <Kpi composedStats={composedStats} isLoadingStats={isLoadingStats} />
                    </div>
                    <div className="flex flex-col gap-y-1 text-xs mt-0.5">
                        <div className="w-full flex justify-between items-center bg-primary-900/10 p-0.5">
                            <p className="text-main/80 ml-0.5">Motivos de no venta: </p>
                            <p className="font-bold text-main mr-0.5">{props.no_sale_count}</p>
                        </div>
                        <div className="w-full flex justify-between items-center bg-primary-900/10 p-0.5">
                            <p className="text-main/80 ml-0.5">Tiempo en PDV: </p>
                            <p className="font-bold text-focus-300 mr-0.5">{formatMinutes(tInPdv, 'time')}</p>
                        </div>
                        <div className="w-full flex justify-between items-center bg-primary-950/10 p-0.5">
                            <p className="text-main/80 ml-0.5">Total Vendido: </p>
                            {isLoadingStats ? (
                                <DotsLoader size="sm" />
                            ) : (
                                <p className="font-bold text-focus-300 mr-0.5 before:content-['$']">{formatMoney(composedStats.total)}</p>
                            )}
                        </div>
                    </div>

                    <hr className="w-full border-main/10 my-1" />
                    <p className="text-xs text-main/50 italic">
                        {`${hasFirstSell ? 'Posee una venta en zona' : 'No posee una venta en zona'}`}
                    </p>
                    <div className="flex justify-between items-center gap-2">
                        {(sellerOrders.orders[seller] || sellerGps.gps[seller]) && (
                            <button
                                title="Línea de tiempo"
                                onClick={() =>
                                    toggle(
                                        <TimeLine
                                            orders={sellerOrders.orders[seller] ?? []}
                                            clients={cList}
                                            seller={seller}
                                            gps={sellerGps.gps[seller] ?? []}
                                            clientsBySeller={clientsBySeller}
                                        />,
                                        <h2 className="text-main font-semibold">{sellerById[seller].sellerName}<span className="text-focus-300 before:content-['#'] ml-2">{seller}</span></h2>,
                                        `timeline-${seller}`
                                    )}
                                className={`
                                    w-10 p-2 rounded-dx flex justify-center items-center cursor-pointer
                                    transition-all shadow-xs border
                                    ${cntxbarOpen ? 'bg-focus-500 border-focus-300 text-variant shadow-focus-500/20' : 'bg-primary-900/80 hover:bg-focus-500/30 border-main/10 text-main'}
                                `}
                            >
                                <MapIcon className={`size-4 ${cntxbarOpen ? 'stroke-variant' : 'stroke-main'}`} />
                            </button>
                        )}
                        {hasRoute && (
                            <button
                                className={`border p-2 w-full rounded-dx shadow-xs cursor-pointer flex items-center justify-between transition-all ${isFocus
                                    ? 'bg-focus-500 text-variant border-focus-300/60 shadow-focus-500/20'
                                    : 'bg-primary-900/80 hover:bg-primary-500/30 border-main/10 text-main'
                                    }`}
                                onClick={focusOnSeller}
                            >
                                {isFocus ? (
                                    <p className="ml-5 text-variant font-medium text-xs">Deseleccionar</p>
                                ) : (
                                    <p className="ml-5 text-main/60 text-xs">Seleccionar</p>
                                )}
                                <ThumbTackIcon className={`${isFocus ? 'fill-variant' : 'fill-main/50'} size-4 mr-2`} />
                            </button>
                        )}
                        {SHOWGPS && (
                            <button onClick={() => drawValhallaLine(seller)} className="bg-focus-500 hover:bg-focus-300 p-1.5 px-3 rounded-dx text-variant text-xs font-medium shadow-xs transition-colors">
                                GPS Data
                            </button>
                        )}
                        {SNAKEIT && isFocus ? (
                            <>
                                <button
                                    onClick={() => snakeOnSeller('start-stop')}
                                    className="bg-focus-500 hover:bg-focus-300 w-fit p-2.5 rounded-dx text-variant shadow-xs cursor-pointer flex justify-between items-center transition-colors">
                                    {imAnimated ? (
                                        <div className="bg-variant size-3 rounded-xs" />
                                    ) : (
                                        <PlayIcon className="fill-variant size-3" />
                                    )}
                                </button>
                                <button
                                    disabled={!imAnimated}
                                    onClick={() => snakeOnSeller('pause-resume')}
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
            ) : (
                <span className="italic text-xs text-main/40">No inicio ruta</span>
            )}

            <div className="flex flex-wrap gap-1.5">
                {visibleTags &&
                    tags.map((tag) =>
                        tag.labels.map((key) => {
                            return <Label key={key} name={key} />;
                        })
                    )}
            </div>
        </div>
    );
};

export default Item;    
